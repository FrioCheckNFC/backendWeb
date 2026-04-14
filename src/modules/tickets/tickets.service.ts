import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority, TicketType } from './entities/ticket.entity';
import { Machine } from '../machines/entities/machine.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,

    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  /**
   * Crear un nuevo ticket
   * El usuario actual será asignado como reportedById automáticamente
   */
  async create(data: Partial<Ticket>, currentUserId: string): Promise<any> {
    // Usar el usuario autenticado como quien reporta el ticket
    data.reportedById = currentUserId;

    // Validar que la máquina existe si se proporciona
    if (data.machineId) {
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
    }

    const ticket = this.ticketsRepo.create(data);
    const saved = await this.ticketsRepo.save(ticket);

    // Enriquecer con relaciones
    return this.enrichTicket(saved);
  }

  /**
   * Obtener todos los tickets con filtros
   */
  async findAll(
    tenantId: string,
    status?: TicketStatus,
    priority?: TicketPriority,
    skip = 0,
    take = 20,
  ): Promise<{ tickets: any[]; total: number }> {
    const where: any = { tenantId, deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [tickets, total] = await this.ticketsRepo.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    // Enriquecer cada ticket con sus relaciones
    const enrichedTickets = await Promise.all(
      tickets.map((ticket) => this.enrichTicket(ticket))
    );

    return { tickets: enrichedTickets, total };
  }

  /**
   * Obtener un ticket por ID
   */
  async findOne(id: string, tenantId: string): Promise<any> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    // Enriquecer con relaciones
    return this.enrichTicket(ticket);
  }

  /**
   * Actualizar un ticket
   */
  async update(id: string, tenantId: string, data: Partial<Ticket>): Promise<any> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    Object.assign(ticket, data);
    const updated = await this.ticketsRepo.save(ticket);

    // Enriquecer con relaciones
    return this.enrichTicket(updated);
  }

  /**
   * Asignar un ticket a un técnico
   */
  async assign(id: string, tenantId: string, assignedToId: string): Promise<any> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    // Solo se puede asignar tickets que no estén cerrados
    if (ticket.status === TicketStatus.RESOLVED) {
      throw new ConflictException('No se pueden asignar tickets cerrados o cancelados');
    }

    ticket.assignedToId = assignedToId;

    // Si el ticket está en estado OPEN, cambiar a ASSIGNED
    if (ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.ASSIGNED;
    }

    const updated = await this.ticketsRepo.save(ticket);

    // Enriquecer con relaciones
    return this.enrichTicket(updated);
  }

  /**
   * Marcar un ticket como resuelto
   */
  async resolve(id: string, tenantId: string, resolutionNotes?: string): Promise<any> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    // Validar que el ticket esté asignado
    if (!ticket.assignedToId) {
      throw new ConflictException('No se puede resolver un ticket sin asignar');
    }

    ticket.status = TicketStatus.RESOLVED;
    ticket.resolvedAt = new Date();
    if (resolutionNotes) {
      ticket.resolutionNotes = resolutionNotes;
    }

    const updated = await this.ticketsRepo.save(ticket);

    // Enriquecer con relaciones
    return this.enrichTicket(updated);
  }

  /**
   * Cambiar estado a IN_PROGRESS
   */
  async markInProgress(id: string, tenantId: string): Promise<any> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id, tenantId, deletedAt: IsNull() },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    if (!ticket.assignedToId) {
      throw new ConflictException('El ticket debe estar asignado antes');
    }

    ticket.status = TicketStatus.IN_PROGRESS;
    const updated = await this.ticketsRepo.save(ticket);

    // Enriquecer con relaciones
    return this.enrichTicket(updated);
  }

  /**
   * Eliminar un ticket (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    const ticket = await this.findOne(id, tenantId);
    await this.ticketsRepo.softDelete({ id: ticket.id });
  }

  /**
   * Obtener tickets por estado
   */
  async findByStatus(tenantId: string, status: TicketStatus): Promise<Ticket[]> {
    return this.ticketsRepo.find({
      where: { tenantId, status, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tickets asignados a un usuario
   */
  async findByAssignedUser(tenantId: string, assignedToId: string): Promise<Ticket[]> {
    return this.ticketsRepo.find({
      where: { tenantId, assignedToId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tickets reportados por un usuario
   */
  async findByReporter(tenantId: string, reportedById: string): Promise<Ticket[]> {
    return this.ticketsRepo.find({
      where: { tenantId, reportedById, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cargar relaciones de un ticket (máquina, usuarios)
   * Devuelve el ticket enriquecido con datos de máquina y usuarios
   */
  private async enrichTicket(ticket: Ticket): Promise<any> {
    const enriched: any = { ...ticket };

    // Cargar máquina si existe
    if (ticket.machineId) {
      enriched.machine = await this.machinesRepo.findOne({
        where: {
          id: ticket.machineId,
          deletedAt: IsNull(),
        },
      });
    }

    // Cargar usuario que reportó
    if (ticket.reportedById) {
      const reportedByUser = await this.usersRepo.findOne({
        where: {
          id: ticket.reportedById,
          deletedAt: IsNull(),
        },
      });
      if (reportedByUser) {
        enriched.reportedBy = {
          id: reportedByUser.id,
          email: reportedByUser.email,
          firstName: reportedByUser.firstName,
          lastName: reportedByUser.lastName,
          phone: reportedByUser.phone,
          role: reportedByUser.role,
          active: reportedByUser.active,
        };
      }
    }

    // Cargar usuario asignado
    if (ticket.assignedToId) {
      const assignedToUser = await this.usersRepo.findOne({
        where: {
          id: ticket.assignedToId,
          deletedAt: IsNull(),
        },
      });
      if (assignedToUser) {
        enriched.assignedTo = {
          id: assignedToUser.id,
          email: assignedToUser.email,
          firstName: assignedToUser.firstName,
          lastName: assignedToUser.lastName,
          phone: assignedToUser.phone,
          role: assignedToUser.role,
          active: assignedToUser.active,
        };
      }
    }

    // Cargar usuario que resolvió
    if (ticket.resolvedById) {
      const resolvedByUser = await this.usersRepo.findOne({
        where: {
          id: ticket.resolvedById,
          deletedAt: IsNull(),
        },
      });
      if (resolvedByUser) {
        enriched.resolvedBy = {
          id: resolvedByUser.id,
          email: resolvedByUser.email,
          firstName: resolvedByUser.firstName,
          lastName: resolvedByUser.lastName,
          phone: resolvedByUser.phone,
          role: resolvedByUser.role,
          active: resolvedByUser.active,
        };
      }
    }

    return enriched;
  }
}
