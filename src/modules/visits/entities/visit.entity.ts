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
@Index(['tenantId', 'technicianId'])
@Index(['tenantId', 'machineId'])
@Index(['tenantId', 'status'])
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant (multi-tenant)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK al tecnico
  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  // FK a máquina
  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  // Coordenadas registradas en la visita
  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude: number | null;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude: number | null;

  // FK al tag NFC
  @Column({ name: 'nfc_tag_id', type: 'uuid', nullable: true })
  nfcTagId: string | null;

  @Column({ name: 'temperature', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  // Estado de la visita
  @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
  status: string | null;

  // Tipo de visita
  @Column({ name: 'type', type: 'varchar', length: 50, nullable: true })
  type: string | null;

  @Column({ name: 'visited_at', type: 'timestamp', nullable: true })
  visitedAt: Date | null;

  @Column({ name: 'tenant_name', type: 'varchar', length: 255, nullable: true })
  tenantName: string | null;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
