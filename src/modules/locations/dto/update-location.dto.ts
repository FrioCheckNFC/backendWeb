import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
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
    example: '550e8400-e29b-41d4-a716-446655440111',
    description: 'ID del sector asociado',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  sectorId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440222',
    description: 'ID del retailer asociado',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  retailerId?: string;

  @ApiProperty({
    example: 'Jumbo Ñuñoa - Actualizado',
    description: 'Nombre del local',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Cra 7 #123-50, Bogotá, Colombia',
    description: 'Dirección física del local',
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
    example: 'Jumbo Chile S.A.',
    description: 'Nombre del retailer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  retailerName?: string;

  @ApiProperty({
    example: '96.765.432-1',
    description: 'RUT del retailer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  retailerRut?: string;

  @ApiProperty({
    example: '+56912345678',
    description: 'Teléfono del retailer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  retailerPhone?: string;

  @ApiProperty({
    example: 'retailer-jumbo@friocheck.com',
    description: 'Email del retailer',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  retailerEmail?: string;

  @ApiProperty({
    example: true,
    description: 'Indicar si el local está activo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
