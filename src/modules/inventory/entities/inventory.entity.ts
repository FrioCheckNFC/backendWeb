import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum InventoryStatus {
  DISPONIBLE = 'disponible',
  EN_USO = 'en_uso',
  AGOTADO = 'agotado',
  EN_PEDIDO = 'en_pedido',
}

@Entity('inventory')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'partNumber'], { unique: true })
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Nombre de la parte
  @Column({ name: 'part_name', type: 'varchar', length: 255 })
  partName: string;

  // Número de parte (SKU)
  @Column({ name: 'part_number', type: 'varchar', length: 255 })
  partNumber: string;

  // Descripción
  @Column({ type: 'text', nullable: true })
  description: string;

  // Cantidad en stock
  @Column({ type: 'int', default: 0 })
  quantity: number;

  // Cantidad mínima para alerta
  @Column({ name: 'min_quantity', type: 'int', default: 5 })
  minQuantity: number;

  // Costo unitario
  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  // Estado del inventario
  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.DISPONIBLE,
  })
  status: InventoryStatus;

  // Ubicación física
  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
