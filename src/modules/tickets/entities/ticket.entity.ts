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
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'baja',
  MEDIUM = 'media',
  HIGH = 'alta',
  CRITICAL = 'critica',
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

  // Usuario que reportó el problema
  @Column({ name: 'reported_by_id', type: 'uuid' })
  reportedById: string;

  // Usuario asignado a resolver el ticket
  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId: string;

  // Usuario que resolvió el ticket
  @Column({ name: 'resolved_by_id', type: 'uuid', nullable: true })
  resolvedById: string;

  // Tipo de ticket
  @Column({
    type: 'enum',
    enum: TicketType,
    default: TicketType.FALLA,
  })
  type: TicketType;

  // Prioridad del ticket
  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  // Estado del ticket
  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  // Título del ticket
  @Column({ type: 'varchar', length: 255 })
  title: string;

  // Descripción del problema
  @Column({ type: 'text', nullable: true })
  description: string;

  // Si se puede usar entrada manual
  @Column({ name: 'can_use_manual_entry', type: 'boolean', default: false })
  canUseManualEntry: boolean;

  // ID de máquina ingresada manualmente (si no se encontró por NFC)
  @Column({ name: 'manual_machine_id', type: 'varchar', length: 255, nullable: true })
  manualMachineId: string;

  // URL de foto de la placa de máquina
  @Column({ name: 'machine_photo_plate_url', type: 'varchar', length: 2048, nullable: true })
  machinePhotoPlateUrl: string;

  // Notas de resolución
  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  // Fecha de resolución
  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;

  // Fecha límite para resolver
  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  // Tiempo invertido en minutos
  @Column({ name: 'time_spent_minutes', type: 'int', default: 0 })
  timeSpentMinutes: number;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
