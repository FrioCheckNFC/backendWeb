import { ApiProperty } from '@nestjs/swagger';

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
    description: 'ID de la maquina asociada',
    nullable: true,
  })
  machineId!: string | null;

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
    example: '2026-04-08T15:30:00Z',
    description: 'Fecha de la venta',
  })
  saleDate!: Date;

  @ApiProperty({
    example: 'SuperFrio Refrigeracion',
    description: 'Nombre del tenant',
    nullable: true,
  })
  tenantName!: string | null;

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
