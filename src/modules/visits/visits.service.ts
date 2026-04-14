import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Visit, VisitStatus } from './entities/visit.entity';
import { Machine } from '../machines/entities/machine.entity';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitsRepo: Repository<Visit>,

    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,
  ) {}

  /**
   * Crear una nueva visita (check-in)
   */
  async create(data: Partial<Visit>): Promise<Visit> {
    // Validar campos requeridos
    if (!data.tenantId || !data.userId || !data.machineId) {
      throw new Error(
        `Campos requeridos faltantes: tenantId=${data.tenantId}, userId=${data.userId}, machineId=${data.machineId}`,
      );
    }

    // Validar que la máquina existe
    const machine = await this.machinesRepo.findOne({
      where: {
        id: data.machineId,
        tenantId: data.tenantId,
        deletedAt: IsNull(),
      },
    });

    if (!machine) {
      throw new NotFoundException(
        `Máquina con ID ${data.machineId} no encontrada para este tenant`,
      );
    }

    // Convertir fechas si es necesario
    if (data.checkInTimestamp && typeof data.checkInTimestamp === 'string') {
      data.checkInTimestamp = new Date(data.checkInTimestamp);
    }
    if (!data.checkInTimestamp) {
      data.checkInTimestamp = new Date();
    }

    // Asegurar defaults
    if (!data.status) {
      data.status = VisitStatus.ABIERTA;
    }

    const visit = this.visitsRepo.create(data);
    return this.visitsRepo.save(visit);
  }

  /**
   * Realizar check-out de una visita
   */
  async checkout(id: string, tenantId: string, checkoutData: Partial<Visit>): Promise<Visit> {
    const visit = await this.findOne(id, tenantId);

    if (visit.checkOutTimestamp) {
      throw new ConflictException('Esta visita ya ha sido checkout');
    }

    // Usar la fecha actual si no se proporciona
    if (!checkoutData.checkOutTimestamp) {
      checkoutData.checkOutTimestamp = new Date();
    }

    // Validar que checkout sea posterior a checkin
    if (checkoutData.checkOutTimestamp < visit.checkInTimestamp) {
      throw new ConflictException(
        'La hora de checkout no puede ser anterior a check-in',
      );
    }

    checkoutData.status = VisitStatus.CERRADA;

    Object.assign(visit, checkoutData);
    return this.visitsRepo.save(visit);
  }

  /**
   * Obtener todas las visitas con filtros
   */
  async findAll(
    tenantId: string,
    userId?: string,
    machineId?: string,
    status?: VisitStatus,
    skip = 0,
    take = 20,
  ): Promise<{ visits: Visit[]; total: number }> {
    const where: any = { tenantId, deletedAt: null };

    if (userId) {
      where.userId = userId;
    }

    if (machineId) {
      where.machineId = machineId;
    }

    if (status) {
      where.status = status;
    }

    const [visits, total] = await this.visitsRepo.findAndCount({
      where,
      skip,
      take,
      order: { checkInTimestamp: 'DESC' },
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
  async update(id: string, tenantId: string, data: Partial<Visit>): Promise<Visit> {
    const visit = await this.findOne(id, tenantId);
    Object.assign(visit, data);
    return this.visitsRepo.save(visit);
  }

  /**
   * Obtener visitas de un usuario en un rango de fechas
   */
  async findByUserDateRange(
    tenantId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Visit[]> {
    return this.visitsRepo.find({
      where: {
        tenantId,
        userId,
        checkInTimestamp: Between(startDate, endDate),
        deletedAt: IsNull(),
      },
      order: { checkInTimestamp: 'DESC' },
    });
  }

  /**
   * Obtener visitas activas (ABIERTA sin CERRADA)
   */
  async findActiveVisits(tenantId: string): Promise<Visit[]> {
    return this.visitsRepo.find({
      where: {
        tenantId,
        status: VisitStatus.ABIERTA,
        deletedAt: IsNull(),
      },
      order: { checkInTimestamp: 'DESC' },
    });
  }

  /**
   * Obtener duración de una visita en minutos
   */
  getVisitDurationMinutes(visit: Visit): number {
    if (!visit.checkOutTimestamp) {
      return 0;
    }
    const durationMs = visit.checkOutTimestamp.getTime() - visit.checkInTimestamp.getTime();
    return Math.floor(durationMs / 60000); // Convertir a minutos
  }

  /**
   * Eliminar una visita (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    const visit = await this.findOne(id, tenantId);
    await this.visitsRepo.softDelete({ id: visit.id });
  }
}
