import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  IsString,
  MaxLength,
  IsISO8601,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryStatus } from '../entities/sale.entity';

export class CreateSaleInventoryItemDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174200',
    description: 'ID del item de inventario a vender',
  })
  @IsNotEmpty({ message: 'El ID del inventario es obligatorio' })
  @IsUUID()
  inventoryId!: string;

  @ApiProperty({
    example: 12,
    description: 'Cantidad de unidades a vender',
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity!: number;

  @ApiProperty({
    example: 2500.00,
    description: 'Precio unitario para esta venta (si difiere del costo de inventario)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPriceOverride?: number;

  @ApiProperty({
    example: 500.00,
    description: 'Descuento a aplicar en este item de inventario',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({
    example: 'Producto con promoción especial',
    description: 'Notas sobre el item de inventario',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSaleDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del tenant (se asigna automáticamente desde el token)',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440001',
    description: 'UUID del vendedor (usuario con role VENDOR)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655440002',
    description: 'UUID del sector/local donde se realiza la venta',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectorId?: string;

  @ApiProperty({
    example: '880e8400-e29b-41d4-a716-446655440004',
    description: 'UUID del minorista/cliente (usuario con role RETAILER)',
  })
  @IsNotEmpty({ message: 'El ID del minorista es obligatorio' })
  @IsUUID()
  retailerId!: string;

  @ApiProperty({
    example: 'Venta de productos variados',
    description: 'Descripción o notas de la venta',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: DeliveryStatus,
    example: 'PENDING',
    description: 'Estado inicial de entrega',
    required: false,
  })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  deliveryStatus?: DeliveryStatus;

  @ApiProperty({
    example: '2026-04-08T15:30:00Z',
    description: 'Fecha y hora de la venta (ISO 8601)',
  })
  @IsNotEmpty({ message: 'La fecha de venta es obligatoria' })
  @IsISO8601()
  saleDate!: string;

  @ApiProperty({
    example: '2026-04-09T10:00:00Z',
    description: 'Fecha y hora de entrega estimada',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  deliveryDate?: string;

  @ApiProperty({
    type: [CreateSaleInventoryItemDto],
    description: 'Items de inventario incluidos en la venta',
  })
  @IsNotEmpty({ message: 'Debe incluir al menos un item' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInventoryItemDto)
  inventoryItems!: CreateSaleInventoryItemDto[];
}
