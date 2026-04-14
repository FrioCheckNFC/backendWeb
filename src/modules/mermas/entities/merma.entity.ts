import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('mermas')
@Index(['tenantId', 'ticketId'])
@Index(['tenantId', 'machineId'])
export class Merma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK al usuario que reportó la merma
  @Column({ name: 'reported_by_id', type: 'uuid' })
  reportedById: string;

  // FK a ticket (opcional)
  @Column({ name: 'ticket_id', type: 'uuid', nullable: true })
  ticketId: string;

  // FK a máquina
  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  // Nombre del producto
  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName: string;

  // Cantidad perdida
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  // Costo unitario
  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  // Costo total
  @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2 })
  totalCost: number;

  // Causa de la merma
  @Column({ type: 'text', nullable: true })
  cause: string;

  // Fecha de la merma
  @Column({ name: 'merma_date', type: 'timestamp' })
  mermaDate: Date;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
