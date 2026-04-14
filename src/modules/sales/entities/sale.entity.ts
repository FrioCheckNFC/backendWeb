import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SaleInventoryItem } from './sale-inventory-item.entity';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

@Entity('sales')
@Index(['tenantId', 'vendorId'])
@Index(['tenantId', 'sectorId'])
@Index(['tenantId', 'retailerId'])
@Index(['tenantId', 'saleDate'])
@Index(['tenantId', 'deliveryStatus'])
export class Sale {
  @ApiProperty({
    description: 'ID único de la venta',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del tenant (se asigna automáticamente)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ApiProperty({
    description: 'ID del vendedor/usuario que realiza la venta (user con role VENDOR)',
    example: '660e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  @Column({ name: 'vendor_id', type: 'uuid', nullable: true })
  vendorId: string | null;

  @ApiProperty({
    description: 'ID del sector/local donde se realiza la venta',
    example: '770e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string | null;

  @ApiProperty({
    description: 'ID del minorista/cliente a quien se le vende (user con role RETAILER)',
    example: '880e8400-e29b-41d4-a716-446655440004',
  })
  @Column({ name: 'retailer_id', type: 'uuid' })
  retailerId!: string;

  @ApiProperty({
    description: 'Monto total de la venta (suma de todos los items)',
    example: 150000.75,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @ApiProperty({
    description: 'Descripción o notas de la venta',
    example: 'Venta de productos variados',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Estado de la entrega del pedido',
    enum: DeliveryStatus,
    example: 'PENDING',
  })
  @Column({
    name: 'delivery_status',
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  deliveryStatus!: DeliveryStatus;

  @ApiProperty({
    description: 'Fecha y hora en que se realizó la venta',
    example: '2026-04-08T15:30:00Z',
  })
  @Column({ name: 'sale_date', type: 'timestamp' })
  saleDate!: Date;

  @ApiProperty({
    description: 'Fecha y hora en que se entregó el pedido',
    example: '2026-04-09T10:00:00Z',
    nullable: true,
  })
  @Column({ name: 'delivery_date', type: 'timestamp', nullable: true })
  deliveryDate: Date | null;

  // Relación: items de venta vinculados a inventario
  @OneToMany(() => SaleInventoryItem, (item) => item.sale, { cascade: true, eager: false })
  inventoryItems?: SaleInventoryItem[];

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null = null;
}
