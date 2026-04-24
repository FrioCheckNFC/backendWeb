import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Machine } from '../machines/entities/machine.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Tenant)
    private tenantsRepo: Repository<Tenant>,

    @InjectRepository(Machine)
    private machinesRepo: Repository<Machine>,
  ) {}

  /**
   * Crear un nuevo ticket
   * tenant_id y created_by_id se asignan automáticamente desde el usuario autenticado
   */
  async create(data: CreateTicketDto, currentUserId: string, tenantId: string): Promise<any> {
    const normalizedPriority = this.normalizePriority(data.priority);
    const normalizedStatus = this.normalizeStatus(data.status);

    if (data.assignedToId) {
      await this.validateTechnicianAssignment(tenantId, data.assignedToId);
    }

    const tenant = await this.tenantsRepo.findOne({
      where: { id: tenantId, deletedAt: IsNull() },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Validar que la máquina existe y pertenece al tenant
    const machine = await this.machinesRepo.findOne({
      where: { id: data.machineId, tenantId, deletedAt: IsNull() },
    });

    if (!machine) {
      throw new NotFoundException('Máquina no encontrada o no pertenece al tenant');
    }

    const ticket = this.ticketsRepo.create({
      tenantId,
      machineId: data.machineId,
      reportedById: currentUserId,
      assignedToId: data.assignedToId,
      title: data.title,
      description: data.description,
      priority: normalizedPriority,
      status: normalizedStatus,
      tenantName: tenant?.name,
    });

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
  async update(id: string, tenantId: string, data: UpdateTicketDto): Promise<any> {
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

    await this.validateTechnicianAssignment(tenantId, assignedToId);

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
          role: this.getPrimaryRole(reportedByUser.role),
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
          role: this.getPrimaryRole(assignedToUser.role),
          active: assignedToUser.active,
        };
      }
    }

    // Cargar usuario que resolvió (se deriva del técnico asignado al resolver)
    const resolverUserId = ticket.status === TicketStatus.RESOLVED
      ? ticket.assignedToId
      : ticket.resolvedById;

    if (resolverUserId) {
      enriched.resolvedById = resolverUserId;
      const resolvedByUser = await this.usersRepo.findOne({
        where: {
          id: resolverUserId,
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
          role: this.getPrimaryRole(resolvedByUser.role),
          active: resolvedByUser.active,
        };
      }
    }

    return enriched;
  }

  private getPrimaryRole(roles: UserRole[] | undefined): UserRole | undefined {
    if (!Array.isArray(roles) || roles.length === 0) {
      return undefined;
    }

    return roles[0];
  }

  private normalizePriority(priority?: TicketPriority): TicketPriority {
    if (!priority) {
      return TicketPriority.MEDIUM;
    }

    return String(priority).toLowerCase() as TicketPriority;
  }

  private normalizeStatus(status?: TicketStatus): TicketStatus {
    if (!status) {
      return TicketStatus.OPEN;
    }

    return String(status).toLowerCase() as TicketStatus;
  }

  private async validateTechnicianAssignment(tenantId: string, assignedToId: string): Promise<void> {
    const assignedUser = await this.usersRepo.findOne({
      where: {
        id: assignedToId,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (!assignedUser) {
      throw new NotFoundException(`Usuario con ID ${assignedToId} no encontrado en este tenant`);
    }

    const assignedUserRoles = Array.isArray(assignedUser.role)
      ? assignedUser.role
      : [];

    if (!assignedUserRoles.includes(UserRole.TECHNICIAN)) {
      throw new BadRequestException('assigned_to_id debe pertenecer a un usuario con rol TECHNICIAN');
    }
  }
}
