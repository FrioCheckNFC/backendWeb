import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum VisitStatus {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
  ANULADA = 'ANULADA',
}

@Entity('visits')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'machineId'])
@Index(['tenantId', 'status'])
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant (multi-tenant)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK al usuario (técnico, vendedor, etc)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // FK a máquina
  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  // Timestamp de check-in
  @Column({ name: 'check_in_timestamp', type: 'timestamp', nullable: true })
  checkInTimestamp: Date;

  // Timestamp de check-out
  @Column({ name: 'check_out_timestamp', type: 'timestamp', nullable: true })
  checkOutTimestamp: Date;

  // UID del NFC en check-in
  @Column({ name: 'check_in_nfc_uid', type: 'varchar', length: 255, nullable: true })
  checkInNfcUid: string;

  // UID del NFC en check-out
  @Column({ name: 'check_out_nfc_uid', type: 'varchar', length: 255, nullable: true })
  checkOutNfcUid: string;

  // GPS Latitud en check-in
  @Column({
    name: 'check_in_gps_lat',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  checkInGpsLat: number;

  // GPS Longitud en check-in
  @Column({
    name: 'check_in_gps_lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  checkInGpsLng: number;

  // GPS Latitud en check-out
  @Column({
    name: 'check_out_gps_lat',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  checkOutGpsLat: number;

  // GPS Longitud en check-out
  @Column({
    name: 'check_out_gps_lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  checkOutGpsLng: number;

  // Estado de la visita
  @Column({
    name: 'status',
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.ABIERTA,
  })
  status: VisitStatus;

  // Si la visita es válida
  @Column({ name: 'is_valid', type: 'boolean', default: false })
  isValid: boolean;

  // Notas de validación
  @Column({ name: 'validation_notes', type: 'text', nullable: true })
  validationNotes: string;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
