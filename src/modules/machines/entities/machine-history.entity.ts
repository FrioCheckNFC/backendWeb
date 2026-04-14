import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum MachineActivityType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  LOCATION_CHANGED = 'LOCATION_CHANGED',
  ACTIVITY_LOG = 'ACTIVITY_LOG',
  SCANNED = 'SCANNED',
  MAINTENANCE_START = 'MAINTENANCE_START',
  MAINTENANCE_END = 'MAINTENANCE_END',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

@Entity('machine_history')
@Index(['machineId', 'createdAt'])
@Index(['tenantId', 'createdAt'])
export class MachineHistory {
  // Clave primaria UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK a Machine
  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  // FK al tenant
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Tipo de actividad
  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: MachineActivityType,
  })
  activityType: MachineActivityType;

  // Descripción del cambio
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Valores anteriores (JSON)
  @Column({ name: 'previous_values', type: 'jsonb', nullable: true })
  previousValues: Record<string, any>;

  // Valores nuevos (JSON)
  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  // Usuario que realizó la acción (pueda ser un ID o un nombre)
  @Column({ name: 'performed_by', type: 'varchar', length: 255, nullable: true })
  performedBy: string;

  // Timestamp automático
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
