import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class UpdateVisitDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'ID del tecnico',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID de la maquina',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @ApiProperty({
    example: -33.4489,
    description: 'Latitud GPS de la visita',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({
    example: -70.6693,
    description: 'Longitud GPS de la visita',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440010',
    description: 'ID del tag NFC asociado',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  nfcTagId?: string;

  @ApiProperty({
    example: -18.5,
    description: 'Temperatura medida durante la visita',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({
    example: 'Visita completada sin incidentes',
    description: 'Notas de la visita',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({
    example: 'CERRADA',
    description: 'Estado de la visita',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiProperty({
    example: 'MANTENCION',
    description: 'Tipo de visita',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @ApiProperty({
    example: '2026-04-20T10:30:00Z',
    description: 'Fecha y hora de la visita (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  visitedAt?: string;
}
