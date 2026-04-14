import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({
    example: 'Sucursal Bogotá - Actualizada',
    description: 'Nombre de la ubicación',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Cra 7 #123-50, Bogotá, Colombia',
    description: 'Dirección física',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address: string;

  @ApiProperty({
    example: 4.7115,
    description: 'Latitud',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    example: -74.008,
    description: 'Longitud',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre del contacto',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
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
    example: 'Centro de distribución principal - Hub logístico',
    description: 'Descripción adicional',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    example: true,
    description: 'Indicar si la ubicación está activa',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
