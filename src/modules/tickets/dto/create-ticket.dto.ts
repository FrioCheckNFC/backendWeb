import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsIn,
  MinLength,
  IsOptional,
} from 'class-validator';
import { TicketPriority, TicketStatus } from '../entities/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la máquina relacionada al ticket',
  })
  @IsNotEmpty()
  @IsUUID()
  machineId: string;

  @ApiProperty({ 
    example: 'high', 
    required: false, 
    enum: TicketPriority,
    description: 'Prioridad del ticket (low, medium, high, critical)' 
  })
  @IsOptional()
  @IsIn(Object.values(TicketPriority), {
    message: 'priority debe ser uno de: low, medium, high, critical',
  })
  priority?: TicketPriority;

  @ApiProperty({
    example: 'open',
    required: false,
    enum: TicketStatus,
    description: 'Estado inicial del ticket (por defecto open)',
  })
  @IsOptional()
  @IsIn(Object.values(TicketStatus), {
    message: 'status debe ser uno de: open, assigned, in_progress, resolved, closed',
  })
  status?: TicketStatus;

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
    example: '660e8400-e29b-41d4-a716-446655440111',
    required: false,
    description: 'ID del técnico asignado (opcional)',
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}