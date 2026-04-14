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
  IsHexColor,
  IsInt,
  IsUUID,
} from 'class-validator';

export class UpdateSectorDto {
  @ApiProperty({
    example: 'Bodegón El Sol - Actualizado',
    description: 'Nombre del local',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Sucursal principal actualizada',
    description: 'Descripción del local',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    example: 'Av. Libertador 45, Este - Nuevo',
    description: 'Dirección física',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address: string;

  @ApiProperty({
    example: -33.8690,
    description: 'Latitud GPS',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    example: -56.1638,
    description: 'Longitud GPS',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre del encargado',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  contactName: string;

  @ApiProperty({
    example: '+56998765432',
    description: 'Teléfono del encargado',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    example: 'juan@example.com',
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
    example: '#3498DB',
    description: 'Color hexadecimal',
    required: false,
  })
  @IsOptional()
  @IsHexColor()
  color: string;

  @ApiProperty({
    example: 'fas-store-alt',
    description: 'Ícono para UI',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon: string;

  @ApiProperty({
    example: 2,
    description: 'Orden de visualización',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({
    example: true,
    description: 'Indica si el local está activo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
