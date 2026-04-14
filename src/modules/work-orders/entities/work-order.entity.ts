import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum WorkOrderType {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSTALLATION = 'INSTALLATION',
  INSPECTION = 'INSPECTION',
  DELIVERY = 'DELIVERY',
  OTHER = 'OTHER',
}

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('work_orders')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'machineId'])
@Index(['tenantId', 'assignedUserId'])
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK a máquina
  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId: string;

  // FK al usuario asignado
  @Column({ name: 'assigned_user_id', type: 'uuid', nullable: true })
  assignedUserId: string;

  // FK a visita (si está asociada)
  @Column({ name: 'visit_id', type: 'uuid', nullable: true })
  visitId: string;

  // Tipo de work order
  @Column({
    type: 'enum',
    enum: WorkOrderType,
    default: WorkOrderType.MAINTENANCE,
  })
  type: WorkOrderType;

  // Estado
  @Column({
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.PENDING,
  })
  status: WorkOrderStatus;

  // UID esperado del NFC
  @Column({ name: 'expected_nfc_uid', type: 'varchar', length: 255, nullable: true })
  expectedNfcUid: string;

  // UID real del NFC escaneado
  @Column({ name: 'actual_nfc_uid', type: 'varchar', length: 255, nullable: true })
  actualNfcUid: string;

  // Si el NFC fue validado correctamente
  @Column({ name: 'nfc_validated', type: 'boolean', default: false })
  nfcValidated: boolean;

  // GPS esperada - Latitud
  @Column({
    name: 'expected_location_lat',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  expectedLocationLat: number;

  // GPS esperada - Longitud
  @Column({
    name: 'expected_location_lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  expectedLocationLng: number;

  // GPS actual - Latitud
  @Column({
    name: 'actual_location_lat',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  actualLocationLat: number;

  // GPS actual - Longitud
  @Column({
    name: 'actual_location_lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  actualLocationLng: number;

  // Fecha estimada de entrega
  @Column({ name: 'estimated_delivery_date', type: 'timestamp', nullable: true })
  estimatedDeliveryDate: Date;

  // Fecha real de entrega
  @Column({ name: 'delivery_date', type: 'timestamp', nullable: true })
  deliveryDate: Date;

  // Descripción del trabajo
  @Column({ type: 'text', nullable: true })
  description: string;

  // Razón de rechazo (si fue rechazado)
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // Usuario que firmó
  @Column({ name: 'signed_by', type: 'varchar', length: 255, nullable: true })
  signedBy: string;

  // URL de la firma
  @Column({ name: 'signature_url', type: 'varchar', length: 2048, nullable: true })
  signatureUrl: string;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
