import {
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNfcTagDto {
  @ApiProperty({
    description: 'UUID de la máquina asociada al tag NFC (el machine_serial_id se asignará automáticamente)',
    example: '595b8f06-5fc4-42f3-854a-2f1b8e1732d1',
  })
  @IsUUID('4', { message: 'El machineId debe ser un UUID válido' })
  machineId: string;

  @ApiProperty({
    description: 'UID único del tag NFC',
    example: 'NFC-68212T',
    maxLength: 255,
  })
  @IsString({ message: 'El UID debe ser un string' })
  @MaxLength(255, { message: 'El UID no puede exceder 255 caracteres' })
  uid: string;

  @ApiProperty({
    description: 'Modelo del tag NFC',
    example: 'NTAG-215',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El modelo del tag debe ser un string' })
  @MaxLength(255, { message: 'El modelo no puede exceder 255 caracteres' })
  tagModel?: string;

  @ApiProperty({
    description: 'Modelo del hardware del lector NFC',
    example: 'NTAG215',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El modelo del hardware debe ser un string' })
  @MaxLength(255, { message: 'El hardware no puede exceder 255 caracteres' })
  hardwareModel?: string;

  @ApiProperty({
    description: 'Si el tag está activo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
