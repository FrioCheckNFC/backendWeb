import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from './entities/sector.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateSectorDto, UpdateSectorDto, SectorResponseDto } from './dto';

interface SectorFilters {
  skip?: number;
  take?: number;
  isActive?: boolean;
  comuna?: string;
  city?: string;
}

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private sectorsRepo: Repository<Sector>,
    @InjectRepository(Tenant)
    private tenantsRepo: Repository<Tenant>,
  ) {}

  /**
   * Crear un nuevo sector (por región y comuna)
   */
  async create(createSectorDto: CreateSectorDto): Promise<SectorResponseDto> {
    // Obtener el nombre del tenant automáticamente desde la tabla de tenants
    const tenant = await this.tenantsRepo.findOne({
      where: { id: createSectorDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con ID ${createSectorDto.tenantId} no encontrado`);
    }

    const sector = this.sectorsRepo.create({
      tenantId: createSectorDto.tenantId,
      tenantName: tenant.name,
      comuna: createSectorDto.comuna,
      city: createSectorDto.city,
      isActive: true,
    });

    const savedSector = await this.sectorsRepo.save(sector);
    return this.mapToResponse(savedSector);
  }

  /**
   * Obtener todos los sectores de un tenant
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

    if (filters.comuna) {
      query.andWhere('sector.comuna ILIKE :comuna', { comuna: `%${filters.comuna}%` });
    }

    if (filters.city) {
      query.andWhere('sector.city ILIKE :city', { city: `%${filters.city}%` });
    }

    const total = await query.getCount();

    const skip = filters.skip || 0;
    const take = filters.take || 20;

    query
      .skip(skip)
      .take(take)
      .orderBy('sector.city', 'ASC')
      .addOrderBy('sector.comuna', 'ASC');

    const sectors = await query.getMany();

    const response = sectors.map((s) => this.mapToResponse(s));

    return { sectors: response, total };
  }

  /**
   * Obtener un sector específico
   */
  async findOne(id: string, tenantId: string): Promise<SectorResponseDto> {
    const sector = await this.sectorsRepo.findOne({
      where: { id, tenantId },
    });

    if (!sector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    return this.mapToResponse(sector);
  }

  /**
   * Actualizar un sector
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
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    if (updateSectorDto.address !== undefined) {
      sector.address = updateSectorDto.address;
    }

    if (updateSectorDto.latitude !== undefined) {
      sector.latitude = updateSectorDto.latitude;
    }

    if (updateSectorDto.longitude !== undefined) {
      sector.longitude = updateSectorDto.longitude;
    }

    if (updateSectorDto.comuna !== undefined) {
      sector.comuna = updateSectorDto.comuna;
    }

    if (updateSectorDto.city !== undefined) {
      sector.city = updateSectorDto.city;
    }

    if (updateSectorDto.isActive !== undefined) {
      sector.isActive = updateSectorDto.isActive;
    }

    const updatedSector = await this.sectorsRepo.save(sector);
    return this.mapToResponse(updatedSector);
  }

  /**
   * Eliminar un sector (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<{ message: string }> {
    const sector = await this.sectorsRepo.findOne({
      where: { id, tenantId },
    });

    if (!sector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    await this.sectorsRepo.softRemove(sector);
    return { message: `Sector ${id} eliminado correctamente` };
  }

  /**
   * Mapear Sector a SectorResponseDto
   */
  private mapToResponse(sector: Sector): SectorResponseDto {
    return {
      id: sector.id,
      tenantId: sector.tenantId,
      tenantName: sector.tenantName,
      address: sector.address,
      latitude: sector.latitude,
      longitude: sector.longitude,
      comuna: sector.comuna,
      city: sector.city,
      isActive: sector.isActive,
      createdAt: sector.createdAt,
      updatedAt: sector.updatedAt,
      deletedAt: sector.deletedAt,
    };
  }
}
