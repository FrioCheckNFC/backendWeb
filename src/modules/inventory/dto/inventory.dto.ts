import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';

export enum InventoryStatus {
  DISPONIBLE = 'disponible',
  EN_USO = 'en_uso',
  AGOTADO = 'agotado',
  EN_PEDIDO = 'en_pedido',
}

export class CreateInventoryDto {
  @ApiProperty({ example: 'Bebida Gaseosa 2L' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  partName: string;

  @ApiProperty({ example: 'SKU-BEBIDA-001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  partNumber: string;

  @ApiProperty({ example: 'Bebida refrescante de cola', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @ApiProperty({ example: 1500 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiProperty({ example: 'Almacén Central', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}

export class UpdateInventoryDto {
  @ApiProperty({ example: 'Bebida Gaseosa 2L', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  partName?: string;

  @ApiProperty({ example: 'SKU-BEBIDA-001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  partNumber?: string;

  @ApiProperty({ example: 'Bebida refrescante', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @ApiProperty({ example: 'Almacén Central', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}

export class InventoryResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  tenantId: string;

  @ApiProperty({ example: 'Bebida Gaseosa 2L' })
  partName: string;

  @ApiProperty({ example: 'SKU-BEBIDA-001' })
  partNumber: string;

  @ApiProperty({ example: 'Bebida refrescante de cola' })
  description: string;

  @ApiProperty({ example: 50 })
  quantity: number;

  @ApiProperty({ example: 10 })
  minQuantity: number;

  @ApiProperty({ example: 1500 })
  unitCost: number;

  @ApiProperty({ enum: InventoryStatus, example: InventoryStatus.DISPONIBLE })
  status: InventoryStatus;

  @ApiProperty({ example: 'Almacén Central' })
  location: string;

  @ApiProperty({ example: '2026-04-08T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-08T12:00:00Z' })
  updatedAt: Date;
}
