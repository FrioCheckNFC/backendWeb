import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignTicketDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'UUID del técnico a asignar',
  })
  @IsNotEmpty({ message: 'El assignedTo es obligatorio' })
  @IsUUID('4', { message: 'assignedTo debe ser un UUID válido' })
  assignedTo: string;
}
