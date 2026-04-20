import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  MaxLength,
  IsISO8601,
  IsNumber,
  Min,
} from 'class-validator';

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
    description: 'UUID de la maquina asociada',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @ApiProperty({
    example: 18000,
    description: 'Monto total de la venta',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

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
    example: '2026-04-08T16:45:00Z',
    description: 'Fecha y hora actualizada de la venta',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  saleDate?: string;
}
