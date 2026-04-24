import { ApiProperty } from '@nestjs/swagger';

export class SectorMachineDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'SN-2024-001' })
  serialNumber: string;

  @ApiProperty({ example: 'Vending Machine Pro V2' })
  model: string;

  @ApiProperty({ example: 'VendTech' })
  brand: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'IN_TRANSIT', 'MAINTENANCE', 'DECOMMISSIONED'] })
  status: string;

  @ApiProperty({ example: 5 })
  nfcTagCount: number;
}

export class SectorResponseDto {
  @ApiProperty({
    example: 'ac6fd307-feaf-4025-b148-77273aaf7902',
  })
  id: string;

  @ApiProperty({
    example: '89922b21-f473-4bea-a883-066440630b68',
  })
  tenantId: string;

  @ApiProperty({
    example: 'SuperFrio Refrigeración',
  })
  tenantName: string;

  @ApiProperty({
    example: 'Bombero Ramón Cornejo Núñez 150-32, Recoleta, Región Metropolitana',
    nullable: true,
  })
  address: string;

  @ApiProperty({
    example: -33.39945100,
    nullable: true,
  })
  latitude: number;

  @ApiProperty({
    example: -70.62863800,
    nullable: true,
  })
  longitude: number;

  @ApiProperty({
    example: 'Recoleta',
  })
  comuna: string;

  @ApiProperty({
    example: 'Región Metropolitana',
  })
  city: string;

  @ApiProperty({
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    example: 10,
    required: false,
  })
  machineCount?: number;

  @ApiProperty({
    example: 25,
    required: false,
  })
  nfcTagCount?: number;

  @ApiProperty({
    type: [SectorMachineDto],
    required: false,
  })
  machines?: SectorMachineDto[];

  @ApiProperty({
    example: '2026-04-09T18:57:39.775256Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-04-09T18:57:39.775256Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  deletedAt: Date;
}
