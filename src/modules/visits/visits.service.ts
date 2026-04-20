import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindOptionsWhere } from 'typeorm';
import { Visit, VisitStatus } from './entities/visit.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateVisitDto, UpdateVisitDto } from './dto';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitsRepo: Repository<Visit>,

    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,

    @InjectRepository(Tenant)
    private tenantsRepo: Repository<Tenant>,
  ) {}

  /**
   * Crear una nueva visita
   */
  async create(
    tenantId: string,
    technicianId: string,
    data: CreateVisitDto,
  ): Promise<Visit> {
    const finalTechnicianId = data.technicianId ?? technicianId;

    // Validar máquina en el tenant
    const machine = await this.machinesRepo.findOne({
      where: {
        id: data.machineId,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (!machine) {
      throw new NotFoundException(
        `Máquina con ID ${data.machineId} no encontrada para este tenant`,
      );
    }

    const tenant = await this.tenantsRepo.findOne({
      where: { id: tenantId, deletedAt: IsNull() },
    });

    const visitedAt = data.visitedAt ? new Date(data.visitedAt) : new Date();

    const visit = this.visitsRepo.create({
      tenantId,
      technicianId: finalTechnicianId,
      machineId: data.machineId,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      nfcTagId: data.nfcTagId ?? null,
      temperature: data.temperature ?? null,
      notes: data.notes ?? null,
      status: data.status ?? VisitStatus.ABIERTA,
      type: data.type ?? null,
      visitedAt,
      tenantName: tenant?.name ?? null,
    });

    return this.visitsRepo.save(visit);
  }

  /**
   * Obtener todas las visitas con filtros
   */
  async findAll(
    tenantId: string,
    technicianId?: string,
    machineId?: string,
    status?: string,
    type?: string,
    skip = 0,
    take = 20,
  ): Promise<{ visits: Visit[]; total: number }> {
    const where: FindOptionsWhere<Visit> = { tenantId, deletedAt: IsNull() };

    if (technicianId) {
      where.technicianId = technicianId;
    }

    if (machineId) {
      where.machineId = machineId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [visits, total] = await this.visitsRepo.findAndCount({
      where,
      skip,
      take,
      order: { visitedAt: 'DESC' },
    });

    return { visits, total };
  }

  /**
   * Obtener una visita por ID
   */
  async findOne(id: string, tenantId: string): Promise<Visit> {
    const visit = await this.visitsRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!visit) {
      throw new NotFoundException(`Visita con ID ${id} no encontrada`);
    }

    return visit;
  }

  /**
   * Actualizar una visita
   */
  async update(id: string, tenantId: string, data: UpdateVisitDto): Promise<Visit> {
    const visit = await this.findOne(id, tenantId);

    if (data.machineId) {
      const machine = await this.machinesRepo.findOne({
        where: {
          id: data.machineId,
          tenantId,
          deletedAt: IsNull(),
        },
      });

      if (!machine) {
        throw new NotFoundException(
          `Máquina con ID ${data.machineId} no encontrada para este tenant`,
        );
      }
    }

    const updateData: Partial<Visit> = {
      ...data,
      visitedAt: data.visitedAt ? new Date(data.visitedAt) : undefined,
    };

    Object.assign(visit, updateData);
    return this.visitsRepo.save(visit);
  }

  /**
   * Eliminar una visita (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    const visit = await this.findOne(id, tenantId);
    await this.visitsRepo.softDelete({ id: visit.id });
  }
}
