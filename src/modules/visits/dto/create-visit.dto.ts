import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDateString,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateVisitDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del tenant (se obtiene del usuario autenticado)',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'ID del usuario técnico (se obtiene del usuario autenticado)',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID de la máquina a visitar',
  })
  @IsNotEmpty()
  @IsUUID()
  machineId!: string;

  @ApiProperty({
    example: '2026-03-31T10:30:00Z',
    description: 'Fecha y hora del check-in (ISO 8601). Si no se proporciona, se usa la fecha actual',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  checkInTimestamp?: string;

  @ApiProperty({
    example: 'FRSYXV',
    description: 'UID del tag NFC en check-in',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  checkInNfcUid?: string;

  @ApiProperty({
    example: 4.71,
    description: 'Latitud GPS del check-in (rango: -90 a 90)',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  checkInGpsLat!: number;

  @ApiProperty({
    example: -74.008,
    description: 'Longitud GPS del check-in (rango: -180 a 180)',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  checkInGpsLng!: number;

  @ApiProperty({
    example: 'Revisión de máquina de hielo en zona norte',
    description: 'Notas sobre la visita',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  validationNotes?: string;
}

