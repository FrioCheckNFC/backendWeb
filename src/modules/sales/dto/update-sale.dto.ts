import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  MaxLength,
  IsISO8601,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryStatus } from '../entities/sale.entity';
import { CreateSaleInventoryItemDto } from './create-sale.dto';

export class UpdateSaleDto {
  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440001',
    description: 'UUID del vendedor',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655440002',
    description: 'UUID del sector',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectorId?: string;

  @ApiProperty({
    example: '880e8400-e29b-41d4-a716-446655440004',
    description: 'UUID del minorista',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  retailerId?: string;

  @ApiProperty({
    example: 'Descripción actualizada',
    description: 'Observaciones de la venta',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: DeliveryStatus,
    example: 'DELIVERED',
    description: 'Estado de la entrega',
    required: false,
  })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  deliveryStatus?: DeliveryStatus;

  @ApiProperty({
    example: '2026-04-08T16:45:00Z',
    description: 'Fecha y hora actualizada de la venta',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  saleDate?: string;

  @ApiProperty({
    example: '2026-04-09T11:30:00Z',
    description: 'Fecha y hora de entrega',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  deliveryDate?: string;

  @ApiProperty({
    type: [CreateSaleInventoryItemDto],
    description: 'Items de inventario (reemplaza los existentes si se proporciona)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInventoryItemDto)
  inventoryItems?: CreateSaleInventoryItemDto[];
}
