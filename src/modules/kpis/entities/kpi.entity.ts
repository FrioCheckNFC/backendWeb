import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum KpiType {
  SALES = 'SALES',
  EFFICIENCY = 'EFFICIENCY',
  QUALITY = 'QUALITY',
  AVAILABILITY = 'AVAILABILITY',
  COST = 'COST',
  CUSTOMER_SATISFACTION = 'CUSTOMER_SATISFACTION',
  OTHER = 'OTHER',
}

@Entity('kpis')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'sectorId'])
@Index(['tenantId', 'type'])
export class Kpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK al usuario (opcional, puede ser KPI general)
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  // FK al sector (opcional)
  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string;

  // Tipo de KPI
  @Column({
    type: 'enum',
    enum: KpiType,
    default: KpiType.OTHER,
  })
  type: KpiType;

  // Nombre del KPI
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Valor objetivo
  @Column({ name: 'target_value', type: 'decimal', precision: 12, scale: 2 })
  targetValue: number;

  // Valor actual
  @Column({ name: 'current_value', type: 'decimal', precision: 12, scale: 2 })
  currentValue: number;

  // Fecha de inicio del período
  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  // Fecha de fin del período
  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
