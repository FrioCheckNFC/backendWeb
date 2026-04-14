import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ResolveTicketDto {
  @ApiProperty({
    example: 'Se reemplazó el compresor. Máquina funcionando normalmente.',
    description: 'Notas finales de la resolución',
  })
  @IsString()
  @MaxLength(2000)
  resolutionNotes: string;
}
