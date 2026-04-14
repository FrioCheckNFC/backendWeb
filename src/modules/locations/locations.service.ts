import {
  Injectable,
  NotFoundException,
  ConflictException,
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
   * Crear una nueva ubicación
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
        `Ya existe una ubicación con el nombre "${createLocationDto.name}" en este tenant`,
      );
    }

    // Validar coordenadas GPS si se proporcionan ambas
    if (createLocationDto.latitude && createLocationDto.longitude) {
      this.validateGpsCoordinates(createLocationDto.latitude, createLocationDto.longitude);
    }

    // Crear ubicación
    const location = this.locationsRepo.create({
      tenantId: createLocationDto.tenantId,
      name: createLocationDto.name,
      address: createLocationDto.address,
      latitude: createLocationDto.latitude,
      longitude: createLocationDto.longitude,
      contactName: createLocationDto.contactName,
      phone: createLocationDto.phone,
      email: createLocationDto.email,
      description: createLocationDto.description,
      isActive: true,
    });

    const savedLocation = await this.locationsRepo.save(location);
    return this.mapToResponse(savedLocation);
  }

  /**
   * Obtener todas las ubicaciones de un tenant con filtros
   */
  async findAll(
    tenantId: string,
    filters: LocationFilters,
  ): Promise<{ locations: LocationResponseDto[]; total: number }> {
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
      locations: locations.map(l => this.mapToResponse(l)),
      total,
    };
  }

  /**
   * Obtener una ubicación específica
   */
  async findOne(id: string, tenantId: string): Promise<LocationResponseDto> {
    const location = await this.locationsRepo.findOne({
      where: { id, tenantId },
    });

    if (!location) {
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    }

    return this.mapToResponse(location);
  }

  /**
   * Obtener ubicaciones por nombre (búsqueda)
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
    const filtered = locations.filter(l =>
      l.name.toLowerCase().includes(name.toLowerCase()),
    );

    return filtered.map(l => this.mapToResponse(l));
  }

  /**
   * Actualizar una ubicación
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
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
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
          `Ya existe una ubicación con el nombre "${updateLocationDto.name}" en este tenant`,
        );
      }

      location.name = updateLocationDto.name;
    }

    // Actualizar campos opcionales
    if (updateLocationDto.address) {
      location.address = updateLocationDto.address;
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

    if (updateLocationDto.contactName !== undefined) {
      location.contactName = updateLocationDto.contactName;
    }

    if (updateLocationDto.phone !== undefined) {
      location.phone = updateLocationDto.phone;
    }

    if (updateLocationDto.email !== undefined) {
      location.email = updateLocationDto.email;
    }

    if (updateLocationDto.description !== undefined) {
      location.description = updateLocationDto.description;
    }

    if (updateLocationDto.isActive !== undefined) {
      location.isActive = updateLocationDto.isActive;
    }

    const updatedLocation = await this.locationsRepo.save(location);
    return this.mapToResponse(updatedLocation);
  }

  /**
   * Eliminar una ubicación (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<{ message: string }> {
    const location = await this.locationsRepo.findOne({
      where: { id, tenantId },
    });

    if (!location) {
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    }

    await this.locationsRepo.softRemove(location);
    return { message: `Ubicación ${id} eliminada correctamente` };
  }

  /**
   * Validar coordenadas GPS
   */
  private validateGpsCoordinates(lat: number, lng: number): boolean {
    if (lat < -90 || lat > 90) {
      throw new Error('La latitud debe estar entre -90 y 90');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('La longitud debe estar entre -180 y 180');
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
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      contactName: location.contactName,
      phone: location.phone,
      email: location.email,
      description: location.description,
      isActive: location.isActive,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }
}
