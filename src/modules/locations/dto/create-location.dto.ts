import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEmail,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del tenant (se obtiene automáticamente del usuario autenticado)',
  })
  @IsOptional()
  @IsUUID('4')
  tenantId?: string;

  @ApiProperty({
    example: 'Sucursal Bogotá',
    description: 'Nombre de la ubicación',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Cra 7 #123-45, Bogotá, Colombia',
    description: 'Dirección física completa',
  })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @IsString()
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  address: string;

  @ApiProperty({
    example: 4.7110,
    description: 'Latitud de la ubicación',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  latitude: number;

  @ApiProperty({
    example: -74.0076,
    description: 'Longitud de la ubicación',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  longitude: number;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del contacto',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre de contacto debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre de contacto no puede exceder 255 caracteres' })
  contactName: string;

  @ApiProperty({
    example: '301-2345678',
    description: 'Teléfono de contacto',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    example: 'contacto@ubicacion.com',
    description: 'Email de contacto',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Centro de distribución principal',
    description: 'Descripción adicional',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;
}
