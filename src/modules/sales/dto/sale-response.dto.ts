import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '../entities/sale.entity';

export class SaleInventoryItemResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174100',
    description: 'ID del item de venta',
  })
  id!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174200',
    description: 'ID del producto en inventario',
  })
  inventoryId!: string;

  @ApiProperty({
    example: 'Bebida Gaseosa 2L',
    description: 'Nombre del producto (desde inventory)',
  })
  inventoryPartName!: string;

  @ApiProperty({
    example: 'SKU-BEBIDA-001',
    description: 'Código del producto (desde inventory)',
    nullable: true,
  })
  inventoryPartNumber: string | null = null;

  @ApiProperty({
    example: 12,
    description: 'Cantidad vendida',
  })
  quantity!: number;

  @ApiProperty({
    example: 2500.00,
    description: 'Precio unitario aplicado en la venta (si es diferente del costo)',
    nullable: true,
  })
  unitPriceOverride: number | null = null;

  @ApiProperty({
    example: 30000.00,
    description: 'Subtotal del item (quantity * (unitPriceOverride || inventoryCost))',
  })
  subtotal!: number;

  @ApiProperty({
    example: 1000.00,
    description: 'Descuento aplicado',
    nullable: true,
  })
  discount: number | null = null;

  @ApiProperty({
    example: 'Promoción especial',
    description: 'Notas del item',
    nullable: true,
  })
  notes: string | null = null;

  @ApiProperty({
    example: '2026-04-08T15:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-04-08T15:30:00Z',
  })
  updatedAt!: Date;
}

export class SaleResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único de la venta',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del tenant',
  })
  tenantId!: string;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440001',
    description: 'ID del vendedor (user con role VENDOR)',
    nullable: true,
  })
  vendorId!: string | null;

  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655440002',
    description: 'ID del sector/local',
    nullable: true,
  })
  sectorId!: string | null;

  @ApiProperty({
    example: '880e8400-e29b-41d4-a716-446655440004',
    description: 'ID del minorista/cliente (user con role RETAILER)',
  })
  retailerId!: string;

  @ApiProperty({
    example: 150000.75,
    description: 'Monto total de la venta',
  })
  amount!: number;

  @ApiProperty({
    example: 'Venta de productos variados',
    description: 'Descripción',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    enum: DeliveryStatus,
    example: 'PENDING',
    description: 'Estado de la entrega',
  })
  deliveryStatus!: DeliveryStatus;

  @ApiProperty({
    example: '2026-04-08T15:30:00Z',
    description: 'Fecha de la venta',
  })
  saleDate!: Date;

  @ApiProperty({
    example: '2026-04-09T10:00:00Z',
    description: 'Fecha de entrega',
    nullable: true,
  })
  deliveryDate!: Date | null;

  @ApiProperty({
    type: [SaleInventoryItemResponseDto],
    description: 'Items de inventario vendidos',
  })
  inventoryItems!: SaleInventoryItemResponseDto[];

  @ApiProperty({
    example: '2026-04-08T15:30:00Z',
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-04-08T16:00:00Z',
    description: 'Fecha de última actualización',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación (soft delete)',
    nullable: true,
  })
  deletedAt!: Date | null;
}
