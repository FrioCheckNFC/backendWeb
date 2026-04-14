import {
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNfcTagDto {
  @ApiProperty({
    description: 'Modelo del tag NFC',
    example: 'MIFARE Classic 1K',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El modelo del tag debe ser un string' })
  @MaxLength(255, { message: 'El modelo no puede exceder 255 caracteres' })
  tagModel?: string;

  @ApiProperty({
    description: 'Modelo del hardware del lector NFC',
    example: 'ACR122U',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El modelo del hardware debe ser un string' })
  @MaxLength(255, { message: 'El hardware no puede exceder 255 caracteres' })
  hardwareModel?: string;

  @ApiProperty({
    description: 'Checksum de integridad del tag',
    example: 'CRC32-ABC123DEF',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El checksum debe ser un string' })
  @MaxLength(255, { message: 'El checksum no puede exceder 255 caracteres' })
  integrityChecksum?: string;

  @ApiProperty({
    description: 'Si el tag está activo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
