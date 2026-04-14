import { ApiProperty } from '@nestjs/swagger';

export class UserContactDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    example: 'roberto@company.com',
  })
  email: string;

  @ApiProperty({
    example: 'Roberto',
  })
  firstName: string;

  @ApiProperty({
    example: 'Díaz',
  })
  lastName: string;

  @ApiProperty({
    example: 'TECHNICIAN',
  })
  role: string;

  @ApiProperty({
    example: '+56912345678',
    nullable: true,
  })
  phone: string;
}

export class SectorMachineDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    example: 'SN-2024-001',
  })
  serialNumber: string;

  @ApiProperty({
    example: 'Vending Machine Pro V2',
  })
  model: string;

  @ApiProperty({
    example: 'VendTech',
    nullable: true,
  })
  brand: string;

  @ApiProperty({
    example: 'ACTIVE',
  })
  status: string;

  @ApiProperty({
    example: 12,
  })
  nfcTagCount: number;
}

export class SectorResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tenantId: string;

  @ApiProperty({
    example: 'Bodegón El Sol',
  })
  name: string;

  @ApiProperty({
    example: 'Sucursal principal con 12 máquinas',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 'Av. Libertador 45, Este',
    nullable: true,
  })
  address: string;

  @ApiProperty({
    example: -33.8688,
    nullable: true,
  })
  latitude: number;

  @ApiProperty({
    example: -56.1636,
    nullable: true,
  })
  longitude: number;

  @ApiProperty({
    example: 'Roberto Díaz',
    nullable: true,
    deprecated: true,
    description: '(Deprecated: usar contactUser en su lugar)',
  })
  contactName: string;

  @ApiProperty({
    example: '+56912345678',
    nullable: true,
    deprecated: true,
    description: '(Deprecated: usar contactUser en su lugar)',
  })
  phone: string;

  @ApiProperty({
    example: 'roberto@example.com',
    nullable: true,
    deprecated: true,
    description: '(Deprecated: usar contactUser en su lugar)',
  })
  email: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  contactUserId: string;

  @ApiProperty({
    type: UserContactDto,
    nullable: true,
  })
  contactUser?: UserContactDto;

  @ApiProperty({
    example: '#FF5733',
    nullable: true,
  })
  color: string;

  @ApiProperty({
    example: 'fas-store',
    nullable: true,
  })
  icon: string;

  @ApiProperty({
    example: 1,
  })
  order: number;

  @ApiProperty({
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    example: 12,
  })
  machineCount?: number;

  @ApiProperty({
    example: 12,
  })
  nfcTagCount?: number;

  @ApiProperty({
    type: [SectorMachineDto],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        serialNumber: 'SN-2024-001',
        model: 'Vending Machine Pro V2',
        brand: 'VendTech',
        status: 'ACTIVE',
        nfcTagCount: 12,
      },
    ],
  })
  machines?: SectorMachineDto[];

  @ApiProperty({
    example: '2026-04-01T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-04-07T15:45:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  deletedAt: Date;
}
