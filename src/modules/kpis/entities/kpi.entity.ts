// filepath: src/modules/kpis/entities/kpi.entity.ts
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

export enum KpiCalculationType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  FORMULA = 'FORMULA',
}

export enum KpiFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum KpiCategory {
  VENTAS = 'VENTAS',
  MAQUINAS = 'MAQUINAS',
  TICKETS = 'TICKETS',
  VISITAS = 'VISITAS',
  INVENTARIO = 'INVENTARIO',
  GENERAL = 'GENERAL',
}

@Entity('kpis')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'sectorId'])
@Index(['tenantId', 'type'])
@Index(['tenantId', 'category'])
@Index(['tenantId', 'isGlobal'])
export class Kpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string;

  @Column({
    type: 'enum',
    enum: KpiType,
    default: KpiType.OTHER,
  })
  type: KpiType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: KpiCategory,
    default: KpiCategory.GENERAL,
  })
  category: KpiCategory;

  @Column({ name: 'target_value', type: 'decimal', precision: 12, scale: 2 })
  targetValue: number;

  @Column({ name: 'current_value', type: 'decimal', precision: 12, scale: 2 })
  currentValue: number;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({
    name: 'calculation_type',
    type: 'enum',
    enum: KpiCalculationType,
    default: KpiCalculationType.MANUAL,
  })
  calculationType: KpiCalculationType;

  @Column({ type: 'text', nullable: true })
  formula: string;

  @Column({
    type: 'enum',
    enum: KpiFrequency,
    default: KpiFrequency.MONTHLY,
  })
  frequency: KpiFrequency;

  @Column({ name: 'is_global', type: 'boolean', default: false })
  isGlobal: boolean;

  @Column({ name: 'data_config', type: 'jsonb', nullable: true })
  dataConfig: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
