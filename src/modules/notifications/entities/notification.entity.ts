import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum NotificationChannel {
  PUSH = 'PUSH',         // Push notifications (FCM)
  EMAIL = 'EMAIL',       // Email
  SMS = 'SMS',           // SMS
  IN_APP = 'IN_APP',     // In-app notifications
}

export enum NotificationEvent {
  // Tickets
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  TICKET_IN_PROGRESS = 'TICKET_IN_PROGRESS',
  TICKET_RESOLVED = 'TICKET_RESOLVED',
  TICKET_CLOSED = 'TICKET_CLOSED',

  // Work Orders
  WORK_ORDER_CREATED = 'WORK_ORDER_CREATED',
  WORK_ORDER_ASSIGNED = 'WORK_ORDER_ASSIGNED',
  WORK_ORDER_COMPLETED = 'WORK_ORDER_COMPLETED',
  WORK_ORDER_REJECTED = 'WORK_ORDER_REJECTED',

  // Visits
  VISIT_CHECK_IN = 'VISIT_CHECK_IN',
  VISIT_CHECK_OUT = 'VISIT_CHECK_OUT',
  VISIT_COMPLETED = 'VISIT_COMPLETED',

  // Machines
  MACHINE_STATUS_CHANGED = 'MACHINE_STATUS_CHANGED',
  MACHINE_MAINTENANCE_DUE = 'MACHINE_MAINTENANCE_DUE',
  MACHINE_ALERT = 'MACHINE_ALERT',

  // KPIs
  KPI_UPDATED = 'KPI_UPDATED',
  KPI_TARGET_REACHED = 'KPI_TARGET_REACHED',
  KPI_TARGET_WARNING = 'KPI_TARGET_WARNING',

  // Inventory
  INVENTORY_LOW = 'INVENTORY_LOW',
  INVENTORY_OUT_OF_STOCK = 'INVENTORY_OUT_OF_STOCK',

  // Other
  EVENT_SCHEDULED = 'EVENT_SCHEDULED',
  CUSTOM_NOTIFICATION = 'CUSTOM_NOTIFICATION',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

@Entity('notifications')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'channel'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'event'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK al usuario que recibe la notificación
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Canal de notificación
  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  // Evento que dispara la notificación
  @Column({
    type: 'enum',
    enum: NotificationEvent,
  })
  event: NotificationEvent;

  // Título
  @Column({ type: 'varchar', length: 255 })
  title: string;

  // Mensaje/cuerpo
  @Column({ type: 'text' })
  message: string;

  // Datos adicionales (JSON)
  @Column({ type: 'jsonb', nullable: true })
  data: any;

  // FK a la entidad relacionada (ej: ticket_id, work_order_id, etc)
  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string;

  // Tipo de entidad
  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: true })
  entityType: string;

  // Estado del envío
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  // Código de seguimiento (para FCM, SMS, etc)
  @Column({ name: 'tracking_id', type: 'varchar', length: 255, nullable: true })
  trackingId: string;

  // Fecha/hora de envío
  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  // Fecha/hora de reconocimiento
  @Column({ name: 'acknowledged_at', type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  // URL de callback (si necesita confir mación)
  @Column({ name: 'callback_url', type: 'varchar', length: 2048, nullable: true })
  callbackUrl: string;

  // Reintentos (para canales que lo requieran)
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  // Mensaje de error (si falló)
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
