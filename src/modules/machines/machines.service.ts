import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, IsNull } from 'typeorm';
import { Machine, MachineStatus } from './entities/machine.entity';
import { Location } from '../locations/entities/location.entity';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,
    @InjectRepository(Location)
    private locationsRepo: Repository<Location>,
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

    await this.validateStoreIfPresent(tenantId, data.storeId);

    const machine = this.machinesRepo.create(data);
    const saved = await this.machinesRepo.save(machine);
    return this.enrichMachineWithStoreName(saved);
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

    const enrichedMachines = await this.enrichMachinesWithStoreName(machines);
    return { machines: enrichedMachines, total };
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

    return this.enrichMachineWithStoreName(machine);
  }

  /**
   * Actualizar una máquina
   */
  async update(id: string, tenantId: string, data: Partial<Machine>): Promise<Machine> {
    const machine = await this.findOne(id, tenantId);
    await this.validateStoreIfPresent(tenantId, data.storeId);
    Object.assign(machine, data);
    const updated = await this.machinesRepo.save(machine);
    return this.enrichMachineWithStoreName(updated);
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
    const updated = await this.machinesRepo.save(machine);
    return this.enrichMachineWithStoreName(updated);
  }

  /**
   * Obtener máquinas por estado
   */
  async findByStatus(tenantId: string, status: MachineStatus): Promise<Machine[]> {
    const machines = await this.machinesRepo.find({
      where: { tenantId, status, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    return this.enrichMachinesWithStoreName(machines);
  }

  /**
   * Obtener máquinas asignadas a un usuario
   */
  async findByAssignedUser(tenantId: string, assignedUserId: string): Promise<Machine[]> {
    const machines = await this.machinesRepo.find({
      where: { tenantId, assignedUserId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    return this.enrichMachinesWithStoreName(machines);
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

    return this.enrichMachineWithStoreName(machine);
  }

  private async validateStoreIfPresent(tenantId?: string, storeId?: string): Promise<void> {
    if (!storeId) {
      return;
    }

    const store = await this.locationsRepo.findOne({
      where: {
        id: storeId,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (!store) {
      throw new NotFoundException(`Tienda con ID ${storeId} no encontrada para este tenant`);
    }
  }

  private async enrichMachineWithStoreName(machine: Machine): Promise<Machine> {
    if (!machine.storeId) {
      machine.storeName = undefined;
      return machine;
    }

    const store = await this.locationsRepo.findOne({
      where: {
        id: machine.storeId,
        tenantId: machine.tenantId,
        deletedAt: IsNull(),
      },
    });

    machine.storeName = store?.name;
    return machine;
  }

  private async enrichMachinesWithStoreName(machines: Machine[]): Promise<Machine[]> {
    const storeIds = Array.from(
      new Set(
        machines
          .map((machine) => machine.storeId)
          .filter((storeId): storeId is string => Boolean(storeId)),
      ),
    );

    if (storeIds.length === 0) {
      return machines;
    }

    const stores = await this.locationsRepo.find({
      where: {
        id: In(storeIds),
        deletedAt: IsNull(),
      },
    });

    const storesById = new Map(stores.map((store) => [store.id, store.name]));

    machines.forEach((machine) => {
      machine.storeName = machine.storeId ? storesById.get(machine.storeId) : undefined;
    });

    return machines;
  }
}
