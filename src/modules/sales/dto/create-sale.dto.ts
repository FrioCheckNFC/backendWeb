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
} from 'class-validator';

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
    description: 'UUID de la maquina asociada a la venta',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @ApiProperty({
    example: 15616,
    description: 'Monto total de la venta',
  })
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber()
  @Min(0, { message: 'El monto no puede ser negativo' })
  amount!: number;

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
    example: '2026-04-08T15:30:00Z',
    description: 'Fecha y hora de la venta (ISO 8601)',
  })
  @IsNotEmpty({ message: 'La fecha de venta es obligatoria' })
  @IsISO8601()
  saleDate!: string;
}
