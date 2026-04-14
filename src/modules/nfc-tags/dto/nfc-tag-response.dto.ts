import { ApiProperty } from '@nestjs/swagger';

export class NfcTagResponseDto {
  @ApiProperty({
    description: 'ID único del tag NFC (UUID)',
    example: 'eda94cc6-2f1b-465c-8881-6d479c2ab452',
  })
  id: string;

  @ApiProperty({
    description: 'ID del tenant (multi-tenant)',
    example: 'ff89158e-a521-4168-8a9f-cecb78d6f408',
  })
  tenantId: string;

  @ApiProperty({
    description: 'ID de la máquina asociada',
    example: '595b8f06-5fc4-42f3-854a-2f1b8e1732d1',
  })
  machineId: string;

  @ApiProperty({
    description: 'UID único del tag NFC',
    example: 'NFC-68212T',
  })
  uid: string;

  @ApiProperty({
    description: 'Modelo del tag NFC',
    example: 'NTAG-215',
    nullable: true,
  })
  tagModel: string | null;

  @ApiProperty({
    description: 'Modelo del hardware del lector NFC',
    example: 'NTAG215',
    nullable: true,
  })
  hardwareModel: string | null;

  @ApiProperty({
    description: 'ID de serie de la máquina del tag',
    example: 'SN-RF-00001',
    nullable: true,
  })
  machineSerialId: string | null;

  @ApiProperty({
    description: 'Tenant ID ofuscado para seguridad',
    example: 'ff89158e',
    nullable: true,
  })
  tenantIdObfuscated: string | null;

  @ApiProperty({
    description: 'Checksum de integridad del tag',
    example: 'k57fbxtpm6tvrfg19a074a',
    nullable: true,
  })
  integrityChecksum: string | null;

  @ApiProperty({
    description: 'Si el tag está bloqueado',
    example: false,
  })
  isLocked: boolean;

  @ApiProperty({
    description: 'Si el tag está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-03-30T15:13:37.475249Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-03-30T15:13:37.475249Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Fecha de eliminación (soft delete)',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;
}

export class NfcTagListResponseDto {
  @ApiProperty({
    description: 'Lista de tags NFC',
    type: [NfcTagResponseDto],
  })
  tags: NfcTagResponseDto[];

  @ApiProperty({
    description: 'Total de registros',
    example: 1,
  })
  total: number;
}
