import { ApiProperty } from '@nestjs/swagger';
import { MachineStatus } from '../entities/machine.entity';

export class UpdateMachineResponseDto {
  @ApiProperty({
    description: 'ID único de la máquina (UUID)',
    example: '595b8f06-5fc4-42f3-854a-2f1b8e1732d1',
  })
  id: string;

  @ApiProperty({
    description: 'ID del tenant (multi-tenant)',
    example: 'ff89158e-a521-4168-8a9f-cecb78d6f408',
  })
  tenantId: string;

  @ApiProperty({
    description: 'ID del usuario asignado a la máquina',
    example: 'cfe41b62-9b35-4e8d-9a4f-4a7789a41320',
    nullable: true,
  })
  assignedUserId: string | null;

  @ApiProperty({
    description: 'Número de serie de la máquina',
    example: 'SN-RF-00001',
  })
  serialNumber: string;

  @ApiProperty({
    description: 'Modelo de la máquina',
    example: 'Refrigerador Samsung RF28',
  })
  model: string;

  @ApiProperty({
    description: 'Marca de la máquina',
    example: 'Samsung',
  })
  brand: string;

  @ApiProperty({
    description: 'Nombre de la ubicación',
    example: 'Almacén Central',
  })
  locationName: string;

  @ApiProperty({
    description: 'Latitud de la ubicación',
    example: -34.55568662,
    nullable: true,
  })
  locationLat: number | null;

  @ApiProperty({
    description: 'Longitud de la ubicación',
    example: -58.36408539,
    nullable: true,
  })
  locationLng: number | null;

  @ApiProperty({
    description: 'Estado de la máquina',
    enum: MachineStatus,
    example: MachineStatus.ACTIVE,
  })
  status: MachineStatus;

  @ApiProperty({
    description: 'ID del sector donde está ubicada la máquina',
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  sectorId: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-03-30T15:13:36.77929Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-03-30T15:13:36.77929Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Fecha de eliminación (soft delete)',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;
}
