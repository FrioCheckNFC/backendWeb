import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
}

export enum EntityType {
  MACHINE = 'MACHINE',
  TICKET = 'TICKET',
  VISIT = 'VISIT',
  WORK_ORDER = 'WORK_ORDER',
  USER = 'USER',
  ATTACHMENT = 'ATTACHMENT',
  OTHER = 'OTHER',
}

@Entity('sync_queue')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'entityType'])
export class SyncQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK al usuario que originó la sincronización
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  // Tipo de operación
  @Column({
    name: 'operation_type',
    type: 'enum',
    enum: OperationType,
  })
  operationType: OperationType;

  // Estado de la sincronización
  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  status: SyncStatus;

  // Tipo de entidad
  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  // ID de la entidad
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  // Payload con los datos a sincronizar
  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  // Número de intentos
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  // Máximo de intentos
  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries: number;

  // Mensaje de error (si existe)
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  // Stack de error (si existe)
  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack: string;

  // Próximo reintento en
  @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  // Fecha de sincronización completada
  @Column({ name: 'synced_at', type: 'timestamp', nullable: true })
  syncedAt: Date;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
