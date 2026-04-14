import { ApiProperty } from '@nestjs/swagger';

export class UpdateSectorResponseDto {
  @ApiProperty({
    description: 'ID único del sector (UUID)',
    example: 'a7541a77-9af6-4d45-a9c2-b7415b572584',
  })
  id: string;

  @ApiProperty({
    description: 'ID del tenant (multi-tenant)',
    example: 'ff89158e-a521-4168-8a9f-cecb78d6f408',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Nombre del local/sector',
    example: 'Bodegón El Sol',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del local',
    example: 'Sucursal principal con 12 máquinas',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Si el sector está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Dirección física del sector',
    example: 'Av. Libertador 45, Este',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: 'Latitud GPS del sector',
    example: -33.86880000,
    nullable: true,
  })
  latitude: number | null;

  @ApiProperty({
    description: 'Longitud GPS del sector',
    example: -56.16360000,
    nullable: true,
  })
  longitude: number | null;

  @ApiProperty({
    description: 'Nombre del contacto/encargado del sector',
    example: 'Juan Pérez',
    nullable: true,
  })
  contactName: string | null;

  @ApiProperty({
    description: 'Teléfono del contacto',
    example: '+56998765432',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'Email del contacto',
    example: 'juan@example.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'ID del usuario que es encargado de este sector',
    example: '51339c6d-2876-440d-addb-b4f2229c1928',
    nullable: true,
  })
  contactUserId: string | null;

  @ApiProperty({
    description: 'Color hexadecimal del sector para UI',
    example: '#FF5733',
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    description: 'Ícono para UI',
    example: 'fas-store',
    nullable: true,
  })
  icon: string | null;

  @ApiProperty({
    description: 'Orden de visualización',
    example: 1,
    nullable: true,
  })
  order: number | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-04-07T18:51:40.580514Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-04-07T18:51:40.580514Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Fecha de eliminación (soft delete)',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;
}
