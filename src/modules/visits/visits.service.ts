import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindOptionsWhere } from 'typeorm';
import { Visit, VisitStatus } from './entities/visit.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { NfcTag } from '../nfc-tags/entities/nfc-tag.entity';
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

    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(NfcTag)
    private nfcTagsRepo: Repository<NfcTag>,
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

    await this.validateTenantExists(tenantId);
    await this.validateTechnicianExists(tenantId, finalTechnicianId);

    // Validar máquina en el tenant
    await this.validateMachineExists(tenantId, data.machineId);

    if (data.nfcTagId) {
      await this.validateNfcTagExists(tenantId, data.nfcTagId, data.machineId);
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
      await this.validateMachineExists(tenantId, data.machineId);
    }

    if (data.technicianId) {
      await this.validateTechnicianExists(tenantId, data.technicianId);
    }

    if (data.nfcTagId) {
      const targetMachineId = data.machineId ?? visit.machineId;
      await this.validateNfcTagExists(tenantId, data.nfcTagId, targetMachineId);
    }

    if (data.machineId && !data.nfcTagId && visit.nfcTagId) {
      await this.validateNfcTagExists(tenantId, visit.nfcTagId, data.machineId);
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

  private async validateTenantExists(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepo.findOne({
      where: { id: tenantId, deletedAt: IsNull() },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con ID ${tenantId} no encontrado`);
    }
  }

  private async validateTechnicianExists(
    tenantId: string,
    technicianId: string,
  ): Promise<void> {
    const technician = await this.usersRepo
      .createQueryBuilder('u')
      .select('u.id', 'id')
      .where('u.id = :technicianId', { technicianId })
      .andWhere('u.tenant_id = :tenantId', { tenantId })
      .andWhere(':requiredRole = ANY(u.role)', { requiredRole: 'TECHNICIAN' })
      .andWhere('u.deleted_at IS NULL')
      .getRawOne();

    if (!technician) {
      throw new NotFoundException(
        `Técnico con ID ${technicianId} no encontrado o sin rol TECHNICIAN en este tenant`,
      );
    }
  }

  private async validateMachineExists(
    tenantId: string,
    machineId: string,
  ): Promise<void> {
    const machine = await this.machinesRepo.findOne({
      where: { id: machineId, tenantId, deletedAt: IsNull() },
    });

    if (!machine) {
      throw new NotFoundException(
        `Máquina con ID ${machineId} no encontrada para este tenant`,
      );
    }
  }

  private async validateNfcTagExists(
    tenantId: string,
    nfcTagId: string,
    machineId?: string,
  ): Promise<void> {
    const nfcTag = await this.nfcTagsRepo.findOne({
      where: { id: nfcTagId, tenantId, deletedAt: IsNull() },
    });

    if (!nfcTag) {
      throw new NotFoundException(
        `NFC tag con ID ${nfcTagId} no encontrado para este tenant`,
      );
    }

    if (machineId && nfcTag.machineId !== machineId) {
      throw new BadRequestException(
        `El NFC tag ${nfcTagId} no corresponde a la máquina ${machineId}`,
      );
    }
  }
}
