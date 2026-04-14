import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from './entities/sector.entity';
import { Machine } from '../machines/entities/machine.entity';
import { NfcTag } from '../nfc-tags/entities/nfc-tag.entity';
import { User } from '../users/entities/user.entity';
import { CreateSectorDto, UpdateSectorDto, SectorResponseDto, SectorMachineDto, UserContactDto } from './dto';

interface SectorFilters {
  skip?: number;
  take?: number;
  isActive?: boolean;
}

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private sectorsRepo: Repository<Sector>,
    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,
    @InjectRepository(NfcTag)
    private nfcTagsRepo: Repository<NfcTag>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  /**
   * Crear un nuevo local (sector)
   */
  async create(createSectorDto: CreateSectorDto): Promise<SectorResponseDto> {
    // Validar que el nombre sea único por tenant
    const existing = await this.sectorsRepo.findOne({
      where: {
        tenantId: createSectorDto.tenantId,
        name: createSectorDto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un local con el nombre "${createSectorDto.name}" en este tenant`,
      );
    }

    // Validar coordenadas GPS si se proporcionan ambas
    if (createSectorDto.latitude && createSectorDto.longitude) {
      this.validateGpsCoordinates(createSectorDto.latitude, createSectorDto.longitude);
    }

    // Validar color hexadecimal si se proporciona
    if (createSectorDto.color) {
      this.validateHexColor(createSectorDto.color);
    }

    const sector = this.sectorsRepo.create({
      tenantId: createSectorDto.tenantId,
      name: createSectorDto.name,
      description: createSectorDto.description,
      address: createSectorDto.address,
      latitude: createSectorDto.latitude,
      longitude: createSectorDto.longitude,
      contactUserId: createSectorDto.contactUserId,
      contactName: createSectorDto.contactName,
      phone: createSectorDto.phone,
      email: createSectorDto.email,
      color: createSectorDto.color,
      icon: createSectorDto.icon,
      order: createSectorDto.order ?? 0,
      isActive: true,
    });

    const savedSector = await this.sectorsRepo.save(sector);
    return this.mapToResponse(savedSector);
  }

  /**
   * Obtener todos los locales de un tenant
   */
  async findAll(
    tenantId: string,
    filters: SectorFilters = {},
  ): Promise<{ sectors: SectorResponseDto[]; total: number }> {
    const query = this.sectorsRepo.createQueryBuilder('sector');

    query.where('sector.tenantId = :tenantId', { tenantId });

    if (filters.isActive !== undefined) {
      query.andWhere('sector.isActive = :isActive', { isActive: filters.isActive });
    }

    const total = await query.getCount();

    const skip = filters.skip || 0;
    const take = filters.take || 20;

    query
      .skip(skip)
      .take(take)
      .orderBy('sector."order"', 'ASC')
      .addOrderBy('sector.name', 'ASC');

    const sectors = await query.getMany();

    const response = await Promise.all(
      sectors.map(async (s) => {
        const machineCount = await this.countMachinesBySector(s.id);
        const nfcTagCount = await this.countNfcTagsBySector(s.id);
        const response = this.mapToResponse(s);
        response.machineCount = machineCount;
        response.nfcTagCount = nfcTagCount;
        return response;
      }),
    );

    return { sectors: response, total };
  }

  /**
   * Obtener un local específico
   */
  async findOne(id: string, tenantId: string): Promise<SectorResponseDto> {
    const sector = await this.sectorsRepo.findOne({
      where: { id, tenantId },
    });

    if (!sector) {
      throw new NotFoundException(`Local con ID ${id} no encontrado`);
    }

    const response = this.mapToResponse(sector);
    response.machineCount = await this.countMachinesBySector(id);
    response.nfcTagCount = await this.countNfcTagsBySector(id);

    return response;
  }

  /**
   * Obtener un local con todas sus máquinas y NFC tags
   */
  async findOneWithMachines(id: string, tenantId: string): Promise<SectorResponseDto> {
    const sector = await this.sectorsRepo.findOne({
      where: { id, tenantId },
    });

    if (!sector) {
      throw new NotFoundException(`Local con ID ${id} no encontrado`);
    }

    // Obtener máquinas del sector
    const machines = await this.machinesRepo.find({
      where: { sectorId: id },
      order: { createdAt: 'DESC' },
    });

    // Para cada máquina, contar sus NFC tags
    const machinesWithNfc: SectorMachineDto[] = await Promise.all(
      machines.map(async (machine) => {
        const nfcTagCount = await this.nfcTagsRepo.count({
          where: { machineId: machine.id, isActive: true },
        });

        return {
          id: machine.id,
          serialNumber: machine.serialNumber,
          model: machine.model,
          brand: machine.brand,
          status: machine.status,
          nfcTagCount,
        };
      }),
    );

    const response = this.mapToResponse(sector);
    response.machines = machinesWithNfc;
    response.machineCount = machines.length;
    response.nfcTagCount = machinesWithNfc.reduce((sum, m) => sum + m.nfcTagCount, 0);

    return response;
  }

  /**
   * Contar máquinas en un sector
   */
  async countMachinesBySector(sectorId: string): Promise<number> {
    return this.machinesRepo.count({
      where: { sectorId },
    });
  }

  /**
   * Contar NFC tags en máquinas de un sector
   */
  async countNfcTagsBySector(sectorId: string): Promise<number> {
    const machines = await this.machinesRepo.find({
      where: { sectorId },
      select: ['id'],
    });

    if (machines.length === 0) {
      return 0;
    }

    const machineIds = machines.map((m) => m.id);

    const count = await this.nfcTagsRepo
      .createQueryBuilder('tag')
      .where('tag.machineId IN (:...machineIds)', { machineIds })
      .andWhere('tag.isActive = :isActive', { isActive: true })
      .getCount();

    return count;
  }

  /**
   * Actualizar un local
   */
  async update(
    id: string,
    tenantId: string,
    updateSectorDto: UpdateSectorDto,
  ): Promise<SectorResponseDto> {
    const sector = await this.sectorsRepo.findOne({
      where: { id, tenantId },
    });

    if (!sector) {
      throw new NotFoundException(`Local con ID ${id} no encontrado`);
    }

    // Validar nombre único si cambia
    if (updateSectorDto.name && updateSectorDto.name !== sector.name) {
      const existing = await this.sectorsRepo.findOne({
        where: {
          tenantId,
          name: updateSectorDto.name,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un local con el nombre "${updateSectorDto.name}"`,
        );
      }

      sector.name = updateSectorDto.name;
    }

    // Validar GPS
    if (
      updateSectorDto.latitude !== undefined &&
      updateSectorDto.longitude !== undefined
    ) {
      this.validateGpsCoordinates(updateSectorDto.latitude, updateSectorDto.longitude);
      sector.latitude = updateSectorDto.latitude;
      sector.longitude = updateSectorDto.longitude;
    }

    // Validar color
    if (updateSectorDto.color !== undefined) {
      if (updateSectorDto.color) {
        this.validateHexColor(updateSectorDto.color);
      }
      sector.color = updateSectorDto.color;
    }

    if (updateSectorDto.description !== undefined) {
      sector.description = updateSectorDto.description;
    }

    if (updateSectorDto.address !== undefined) {
      sector.address = updateSectorDto.address;
    }

    if (updateSectorDto.contactUserId !== undefined) {
      sector.contactUserId = updateSectorDto.contactUserId;
    }

    if (updateSectorDto.contactName !== undefined) {
      sector.contactName = updateSectorDto.contactName;
    }

    if (updateSectorDto.phone !== undefined) {
      sector.phone = updateSectorDto.phone;
    }

    if (updateSectorDto.email !== undefined) {
      sector.email = updateSectorDto.email;
    }

    if (updateSectorDto.icon !== undefined) {
      sector.icon = updateSectorDto.icon;
    }

    if (updateSectorDto.order !== undefined) {
      sector.order = updateSectorDto.order;
    }

    if (updateSectorDto.isActive !== undefined) {
      sector.isActive = updateSectorDto.isActive;
    }

    const updatedSector = await this.sectorsRepo.save(sector);
    return this.mapToResponse(updatedSector);
  }

  /**
   * Eliminar un local (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<{ message: string }> {
    const sector = await this.sectorsRepo.findOne({
      where: { id, tenantId },
    });

    if (!sector) {
      throw new NotFoundException(`Local con ID ${id} no encontrado`);
    }

    await this.sectorsRepo.softRemove(sector);
    return { message: `Local ${id} eliminado correctamente` };
  }

  /**
   * Validar coordenadas GPS
   */
  private validateGpsCoordinates(lat: number, lng: number): void {
    if (lat < -90 || lat > 90) {
      throw new BadRequestException('La latitud debe estar entre -90 y 90');
    }
    if (lng < -180 || lng > 180) {
      throw new BadRequestException('La longitud debe estar entre -180 y 180');
    }
  }

  /**
   * Validar color hexadecimal
   */
  private validateHexColor(color: string): void {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(color)) {
      throw new BadRequestException('El color debe ser un hexadecimal válido (ej: #FF5733)');
    }
  }

  /**
   * Mapear Sector a SectorResponseDto
   */
  private mapToResponse(sector: Sector): SectorResponseDto {
    let contactUser: UserContactDto | undefined;

    // Si existe contactUser (datos del encargado), mapear a UserContactDto
    if (sector.contactUser) {
      contactUser = {
        id: sector.contactUser.id,
        email: sector.contactUser.email,
        firstName: sector.contactUser.firstName,
        lastName: sector.contactUser.lastName,
        role: sector.contactUser.role,
        phone: sector.contactUser.phone,
      };
    }

    return {
      id: sector.id,
      tenantId: sector.tenantId,
      name: sector.name,
      description: sector.description,
      address: sector.address,
      latitude: sector.latitude,
      longitude: sector.longitude,
      contactUserId: sector.contactUserId,
      contactUser,
      contactName: sector.contactName,
      phone: sector.phone,
      email: sector.email,
      color: sector.color,
      icon: sector.icon,
      order: sector.order,
      isActive: sector.isActive,
      createdAt: sector.createdAt,
      updatedAt: sector.updatedAt,
      deletedAt: sector.deletedAt,
    };
  }
}
