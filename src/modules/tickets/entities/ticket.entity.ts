import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum TicketType {
  FALLA = 'falla',
  MERMA = 'merma',
  ERROR_NFC = 'error_nfc',
  MANTENIMIENTO = 'mantenimiento',
  OTRO = 'otro',
}

export enum TicketStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('tickets')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'priority'])
@Index(['tenantId', 'machineId'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant (multi-tenant)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK a máquina
  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId: string;

  // Usuario creador del ticket (compatibilidad: se expone como reportedById en API)
  @Column({ name: 'created_by_id', type: 'uuid' })
  reportedById: string;

  // Usuario asignado a resolver el ticket
  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId: string;

  // Usuario que resolvió: se deriva de assignedToId cuando status = RESOLVED
  resolvedById?: string;

  // Prioridad del ticket
  @Column({ type: 'varchar', length: 20, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  // Estado del ticket
  @Column({ type: 'varchar', length: 20, default: TicketStatus.OPEN })
  status: TicketStatus;

  // Título del ticket
  @Column({ type: 'varchar', length: 255 })
  title: string;

  // Descripción del problema
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'tenant_name', type: 'varchar', length: 255, nullable: true })
  tenantName?: string;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
