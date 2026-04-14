// tenants.service.ts
// Logica de negocio para CRUD de tenants (empresas).
// El controller llama a estos metodos, y estos hablan con la BD via TypeORM.

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepo: Repository<Tenant>,
  ) {}

  // Obtener todos los tenants activos
  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener un tenant por su ID
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepo.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }
    return tenant;
  }

  // Crear un tenant nuevo
  async create(dto: CreateTenantDto): Promise<Tenant> {
    // Verificar que el slug no exista
    const exists = await this.tenantsRepo.findOne({ where: { slug: dto.slug } });
    if (exists) {
      throw new BadRequestException('Ya existe un tenant con ese slug');
    }

    const tenant = this.tenantsRepo.create(dto);
    return this.tenantsRepo.save(tenant);
  }

  // Actualizar un tenant existente
  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id); // Lanza 404 si no existe

    // Si cambian el slug, verificar que no este en uso
    if (dto.slug && dto.slug !== tenant.slug) {
      const slugTaken = await this.tenantsRepo.findOne({ where: { slug: dto.slug } });
      if (slugTaken) {
        throw new BadRequestException('Ese slug ya esta en uso');
      }
    }

    Object.assign(tenant, dto);
    return this.tenantsRepo.save(tenant);
  }

  // Soft delete: marca deleted_at pero no borra el registro
  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id); // Lanza 404 si no existe
    await this.tenantsRepo.softRemove(tenant);
  }
}
