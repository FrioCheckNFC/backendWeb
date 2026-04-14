import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsNumber,
  Max,
  Min,
  IsString,
  MaxLength,
} from 'class-validator';

export class CheckOutVisitDto {
  @ApiProperty({
    example: '2026-03-31T14:30:00Z',
    description: 'Fecha y hora de check-out (ISO 8601). Si no se proporciona, se usa la fecha actual',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  checkOutTimestamp?: string;

  @ApiProperty({
    example: 'FRSYXV',
    description: 'UID del tag NFC en check-out',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  checkOutNfcUid?: string;

  @ApiProperty({
    example: 4.72,
    description: 'Latitud GPS del check-out (rango: -90 a 90)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  checkOutGpsLat?: number;

  @ApiProperty({
    example: -74.009,
    description: 'Longitud GPS del check-out (rango: -180 a 180)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  checkOutGpsLng?: number;

  @ApiProperty({
    example: 'Visita completada sin incidentes',
    description: 'Notas de validación de la visita',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  validationNotes?: string;

  @ApiProperty({
    example: false,
    description: 'Indicar si la visita es válida',
    required: false,
  })
  @IsOptional()
  isValid?: boolean;
}
