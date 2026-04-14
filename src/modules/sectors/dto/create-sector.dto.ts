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
  IsHexColor,
  IsInt,
} from 'class-validator';

export class CreateSectorDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del tenant (se asigna automáticamente desde el token)',
  })
  @IsOptional()
  @IsUUID('4')
  tenantId: string;

  @ApiProperty({
    example: 'Bodegón El Sol',
    description: 'Nombre del local',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Sucursal principal con 12 máquinas',
    description: 'Descripción del local',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    example: 'Av. Libertador 45, Este',
    description: 'Dirección física del local',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  address: string;

  @ApiProperty({
    example: -33.8688,
    description: 'Latitud GPS',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  latitude: number;

  @ApiProperty({
    example: -56.1636,
    description: 'Longitud GPS',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  longitude: number;

  @ApiProperty({
    example: 'Roberto Díaz',
    description: 'Nombre del encargado/contacto (Deprecated: usar contactUserId en su lugar)',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  contactName: string;

  @ApiProperty({
    example: '+56912345678',
    description: 'Teléfono del encargado (Deprecated: usar contactUserId en su lugar)',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    example: 'roberto@example.com',
    description: 'Email del encargado (Deprecated: usar contactUserId en su lugar)',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID del usuario que es encargado de este local',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  contactUserId: string;

  @ApiProperty({
    example: '#FF5733',
    description: 'Color hexadecimal para UI',
    required: false,
  })
  @IsOptional()
  @IsHexColor()
  color: string;

  @ApiProperty({
    example: 'fas-store',
    description: 'Ícono para UI',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon: string;

  @ApiProperty({
    example: 1,
    description: 'Orden de visualización',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order: number;
}
