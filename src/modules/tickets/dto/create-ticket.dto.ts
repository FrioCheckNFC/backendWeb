import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  MinLength,
  IsOptional,
} from 'class-validator';
import { TicketType, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la máquina relacionada al ticket',
  })
  @IsNotEmpty()
  @IsUUID()
  machineId: string;

  @ApiProperty({
    example: 'falla',
    enum: TicketType,
    description: 'Tipo de ticket: falla, merma, error_nfc, mantenimiento, otro',
  })
  @IsNotEmpty()
  @IsEnum(TicketType)
  type: TicketType;

  @ApiProperty({ 
    example: 'alta', 
    required: false, 
    description: 'Prioridad: baja, media, alta, critica' 
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({
    example: 'Máquina no enciende',
    description: 'Título descriptivo del problema',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'La máquina reporta falla eléctrica',
    required: false,
    description: 'Descripción detallada del problema',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Si se puede usar entrada manual',
  })
  @IsOptional()
  canUseManualEntry?: boolean;

  @ApiProperty({
    example: 'MANUAL-001',
    required: false,
    description: 'ID de máquina ingresado manualmente',
  })
  @IsOptional()
  @IsString()
  manualMachineId?: string;

  @ApiProperty({
    example: 'https://example.com/photos/machine-001.jpg',
    required: false,
    description: 'URL de foto de la placa de la máquina',
  })
  @IsOptional()
  @IsString()
  machinePhotoPlateUrl?: string;

  @ApiProperty({
    example: '2026-04-10T14:00:00Z',
    required: false,
    description: 'Fecha límite para resolver el ticket',
  })
  @IsOptional()
  dueDate?: Date;
}