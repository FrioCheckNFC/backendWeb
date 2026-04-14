// create-tenant.dto.ts
// Define los datos necesarios para crear un tenant nuevo.
// Solo ADMIN deberia poder crear tenants.

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'SuperFrio Chile', description: 'Nombre de la empresa' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'superfrio-chile', description: 'Slug unico (sin espacios, minusculas)' })
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Empresa de refrigeracion industrial', description: 'Descripcion', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://ejemplo.com/logo.png', description: 'URL del logo', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
