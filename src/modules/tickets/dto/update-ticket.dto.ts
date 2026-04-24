import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { TicketType, TicketPriority, TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketDto {
  @ApiProperty({
    enum: TicketType,
    required: false,
  })
  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @ApiProperty({
    example: 'Título actualizado del ticket',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiProperty({
    example: 'Descripción actualizada del problema',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @ApiProperty({
    enum: TicketPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({
    enum: TicketStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiProperty({
    example: 'Notas de resolución',
    required: false,
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
