import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { Machine, MachineStatus } from './entities/machine.entity';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,
  ) {}

  /**
   * Crear una nueva máquina
   */
  async create(data: Partial<Machine>): Promise<Machine> {
    const { serialNumber, tenantId } = data;

    // Validar que serial + tenant sea único
    const existing = await this.machinesRepo.findOne({
      where: { serialNumber, tenantId, deletedAt: IsNull() },
    });
    if (existing) {
      throw new ConflictException(
        `La máquina con serial ${serialNumber} ya existe en este tenant`,
      );
    }

    const machine = this.machinesRepo.create(data);
    return this.machinesRepo.save(machine);
  }

  /**
   * Obtener máquinas con filtros
   */
  async findAll(
    tenantId: string,
    status?: MachineStatus,
    skip = 0,
    take = 20,
  ): Promise<{ machines: Machine[]; total: number }> {
    const where: FindOptionsWhere<Machine> = { tenantId, deletedAt: IsNull() };

    if (status) {
      where.status = status;
    }

    const [machines, total] = await this.machinesRepo.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return { machines, total };
  }

  /**
   * Obtener una máquina por ID
   */
  async findOne(id: string, tenantId: string): Promise<Machine> {
    const machine = await this.machinesRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!machine) {
      throw new NotFoundException(`Máquina con ID ${id} no encontrada`);
    }

    return machine;
  }

  /**
   * Actualizar una máquina
   */
  async update(id: string, tenantId: string, data: Partial<Machine>): Promise<Machine> {
    const machine = await this.findOne(id, tenantId);
    Object.assign(machine, data);
    return this.machinesRepo.save(machine);
  }

  /**
   * Eliminar una máquina (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    const machine = await this.findOne(id, tenantId);
    await this.machinesRepo.softDelete({ id: machine.id });
  }

  /**
   * Cambiar estado de una máquina
   */
  async changeStatus(id: string, tenantId: string, newStatus: MachineStatus): Promise<Machine> {
    const machine = await this.findOne(id, tenantId);
    machine.status = newStatus;
    return this.machinesRepo.save(machine);
  }

  /**
   * Obtener máquinas por estado
   */
  async findByStatus(tenantId: string, status: MachineStatus): Promise<Machine[]> {
    return this.machinesRepo.find({
      where: { tenantId, status, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener máquinas asignadas a un usuario
   */
  async findByAssignedUser(tenantId: string, assignedUserId: string): Promise<Machine[]> {
    return this.machinesRepo.find({
      where: { tenantId, assignedUserId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener máquina por serial number
   */
  async findBySerialNumber(tenantId: string, serialNumber: string): Promise<Machine> {
    const machine = await this.machinesRepo.findOne({
      where: { tenantId, serialNumber, deletedAt: IsNull() },
    });

    if (!machine) {
      throw new NotFoundException(`Máquina con serial ${serialNumber} no encontrada`);
    }

    return machine;
  }
}
