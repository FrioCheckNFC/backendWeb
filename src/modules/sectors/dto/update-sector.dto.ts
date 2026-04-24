import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateSectorDto {
  @ApiProperty({
    example: 'Bombero Ramón Cornejo Núñez 150-32, Recoleta, Región Metropolitana',
    description: 'Dirección del sector',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  address: string;

  @ApiProperty({
    example: -33.39945100,
    description: 'Latitud GPS del sector',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90, { message: 'La latitud debe ser entre -90 y 90' })
  @Max(90, { message: 'La latitud debe ser entre -90 y 90' })
  latitude: number;

  @ApiProperty({
    example: -70.62863800,
    description: 'Longitud GPS del sector',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180, { message: 'La longitud debe ser entre -180 y 180' })
  @Max(180, { message: 'La longitud debe ser entre -180 y 180' })
  longitude: number;

  @ApiProperty({
    example: 'Recoleta',
    description: 'Comuna del sector',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'La comuna debe tener al menos 2 caracteres' })
  @MaxLength(255, { message: 'La comuna no puede exceder 255 caracteres' })
  comuna: string;

  @ApiProperty({
    example: 'Región Metropolitana',
    description: 'Ciudad o región del sector',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
  @MaxLength(255, { message: 'La ciudad no puede exceder 255 caracteres' })
  city: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el sector está activo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
