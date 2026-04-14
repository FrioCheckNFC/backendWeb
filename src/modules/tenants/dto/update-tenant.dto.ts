// update-tenant.dto.ts
// Define los datos que se pueden modificar de un tenant.
// Todos los campos son opcionales (solo mandas lo que quieras cambiar).

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTenantDto {
  @ApiProperty({ example: 'SuperFrio Updated', description: 'Nuevo nombre', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'superfrio-updated', description: 'Nuevo slug', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Descripcion actualizada', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://ejemplo.com/nuevo-logo.png', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ example: false, description: 'Desactivar/activar el tenant', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
