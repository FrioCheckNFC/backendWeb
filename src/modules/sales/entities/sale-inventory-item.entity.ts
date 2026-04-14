import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Sale } from './sale.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('sale_inventory_items')
@Index(['saleId'])
@Index(['inventoryId'])
@Index(['tenantId'])
export class SaleInventoryItem {
  @ApiProperty({
    description: 'ID único del item de venta',
    example: '123e4567-e89b-12d3-a456-426614174100',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del tenant',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ApiProperty({
    description: 'ID de la venta asociada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'sale_id', type: 'uuid' })
  saleId!: string;

  @ApiProperty({
    description: 'ID del item de inventario',
    example: '123e4567-e89b-12d3-a456-426614174200',
  })
  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId!: string;

  @ApiProperty({
    description: 'Cantidad vendida de este producto',
    example: 12,
  })
  @Column({ type: 'integer' })
  quantity!: number;

  @ApiProperty({
    description: 'Precio unitario aplicado en la venta (puede diferir del costo de inventario)',
    example: 2500.00,
    nullable: true,
  })
  @Column({ name: 'unit_price_override', type: 'numeric', precision: 12, scale: 2, nullable: true })
  unitPriceOverride: number | null = null;

  @ApiProperty({
    description: 'Descuento aplicado a este item',
    example: 500.00,
    nullable: true,
  })
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  discount: number | null = null;

  @ApiProperty({
    description: 'Notas o comentarios sobre el item',
    example: 'Producto con promoción especial',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null = null;

  // Relaciones
  @ManyToOne(() => Sale, (sale) => sale.inventoryItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale!: Sale;

  @ManyToOne(() => Inventory, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inventory_id' })
  inventory!: Inventory;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null = null;
}
