import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto, UpdateLocationDto, LocationResponseDto } from './dto';

interface LocationFilters {
  skip?: number;
  take?: number;
  isActive?: boolean;
}

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepo: Repository<Location>,
  ) {}

  /**
   * Crear una nueva tienda/local
   */
  async create(createLocationDto: CreateLocationDto): Promise<LocationResponseDto> {
    // Validar que el nombre sea único por tenant
    const existingLocation = await this.locationsRepo.findOne({
      where: {
        tenantId: createLocationDto.tenantId,
        name: createLocationDto.name,
      },
    });

    if (existingLocation) {
      throw new ConflictException(
        `Ya existe una tienda con el nombre "${createLocationDto.name}" en este tenant`,
      );
    }

    // Validar coordenadas GPS si se proporcionan ambas
    if (createLocationDto.latitude && createLocationDto.longitude) {
      this.validateGpsCoordinates(createLocationDto.latitude, createLocationDto.longitude);
    }

    // Crear ubicación
    const location = this.locationsRepo.create({
      tenantId: createLocationDto.tenantId,
      sectorId: createLocationDto.sectorId,
      retailerId: createLocationDto.retailerId,
      name: createLocationDto.name,
      address: createLocationDto.address,
      latitude: createLocationDto.latitude,
      longitude: createLocationDto.longitude,
      retailerName: createLocationDto.retailerName,
      retailerRut: createLocationDto.retailerRut,
      retailerPhone: createLocationDto.retailerPhone,
      retailerEmail: createLocationDto.retailerEmail,
      isActive: true,
    });

    const savedLocation = await this.locationsRepo.save(location);
    return this.mapToResponse(savedLocation);
  }

  /**
   * Obtener todas las tiendas de un tenant con filtros
   */
  async findAll(
    tenantId: string,
    filters: LocationFilters,
  ): Promise<{ stores: LocationResponseDto[]; total: number }> {
    const query = this.locationsRepo.createQueryBuilder('location');

    query.where('location.tenantId = :tenantId', { tenantId });

    // Filtrar por estado activo si es especificado
    if (filters.isActive !== undefined) {
      query.andWhere('location.isActive = :isActive', { isActive: filters.isActive });
    }

    // Contar total
    const total = await query.getCount();

    // Paginación
    const skip = filters.skip || 0;
    const take = filters.take || 20;
    query.skip(skip).take(take);

    // Ordenar por nombre
    query.orderBy('location.name', 'ASC');

    const locations = await query.getMany();
    return {
      stores: locations.map((l) => this.mapToResponse(l)),
      total,
    };
  }

  /**
   * Obtener una tienda específica
   */
  async findOne(id: string, tenantId: string): Promise<LocationResponseDto> {
    const location = await this.locationsRepo.findOne({
      where: { id, tenantId },
    });

    if (!location) {
      throw new NotFoundException(`Store con ID ${id} no encontrada`);
    }

    return this.mapToResponse(location);
  }

  /**
   * Obtener stores por nombre (búsqueda)
   */
  async findByName(
    tenantId: string,
    name: string,
  ): Promise<LocationResponseDto[]> {
    const locations = await this.locationsRepo.find({
      where: {
        tenantId,
        isActive: true,
      },
    });

    // Filtrar por coincidencia parcial de nombre
    const filtered = locations.filter((l) =>
      l.name.toLowerCase().includes(name.toLowerCase()),
    );

    return filtered.map((l) => this.mapToResponse(l));
  }

  /**
   * Actualizar una store
   */
  async update(
    id: string,
    tenantId: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    const location = await this.locationsRepo.findOne({
      where: { id, tenantId },
    });

    if (!location) {
      throw new NotFoundException(`Store con ID ${id} no encontrada`);
    }

    // Si se intenta cambiar el nombre, validar unicidad
    if (updateLocationDto.name && updateLocationDto.name !== location.name) {
      const existing = await this.locationsRepo.findOne({
        where: {
          tenantId,
          name: updateLocationDto.name,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe una store con el nombre "${updateLocationDto.name}" en este tenant`,
        );
      }

      location.name = updateLocationDto.name;
    }

    // Actualizar campos opcionales
    if (updateLocationDto.address) {
      location.address = updateLocationDto.address;
    }

    if (updateLocationDto.sectorId !== undefined) {
      location.sectorId = updateLocationDto.sectorId;
    }

    if (updateLocationDto.retailerId !== undefined) {
      location.retailerId = updateLocationDto.retailerId;
    }

    if (
      updateLocationDto.latitude !== undefined &&
      updateLocationDto.longitude !== undefined
    ) {
      this.validateGpsCoordinates(
        updateLocationDto.latitude,
        updateLocationDto.longitude,
      );
      location.latitude = updateLocationDto.latitude;
      location.longitude = updateLocationDto.longitude;
    }

    if (updateLocationDto.retailerName !== undefined) {
      location.retailerName = updateLocationDto.retailerName;
    }

    if (updateLocationDto.retailerRut !== undefined) {
      location.retailerRut = updateLocationDto.retailerRut;
    }

    if (updateLocationDto.retailerPhone !== undefined) {
      location.retailerPhone = updateLocationDto.retailerPhone;
    }

    if (updateLocationDto.retailerEmail !== undefined) {
      location.retailerEmail = updateLocationDto.retailerEmail;
    }

    if (updateLocationDto.isActive !== undefined) {
      location.isActive = updateLocationDto.isActive;
    }

    const updatedLocation = await this.locationsRepo.save(location);
    return this.mapToResponse(updatedLocation);
  }

  /**
   * Eliminar una store (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<{ message: string }> {
    const location = await this.locationsRepo.findOne({
      where: { id, tenantId },
    });

    if (!location) {
      throw new NotFoundException(`Store con ID ${id} no encontrada`);
    }

    await this.locationsRepo.softRemove(location);
    return { message: `Store ${id} eliminada correctamente` };
  }

  /**
   * Validar coordenadas GPS
   */
  private validateGpsCoordinates(lat: number, lng: number): boolean {
    if (lat < -90 || lat > 90) {
      throw new BadRequestException('La latitud debe estar entre -90 y 90');
    }
    if (lng < -180 || lng > 180) {
      throw new BadRequestException('La longitud debe estar entre -180 y 180');
    }
    return true;
  }

  /**
   * Mapear Location a LocationResponseDto
   */
  private mapToResponse(location: Location): LocationResponseDto {
    return {
      id: location.id,
      tenantId: location.tenantId,
      sectorId: location.sectorId,
      retailerId: location.retailerId,
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      retailerName: location.retailerName,
      retailerRut: location.retailerRut,
      retailerPhone: location.retailerPhone,
      retailerEmail: location.retailerEmail,
      isActive: location.isActive,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
      deletedAt: location.deletedAt,
    };
  }
}
