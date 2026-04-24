import {
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNfcTagDto {
  @ApiProperty({
    description: 'ID de la máquina asociada',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'machineId debe ser un UUID válido' })
  machineId?: string;

  @ApiProperty({
    description: 'ID del tenant (para cambiar a otra empresa)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'tenantId debe ser un UUID válido' })
  tenantId?: string;

  @ApiProperty({
    description: 'UID único del tag NFC',
    example: 'NFC-00A1B2C3D4E5F6G7',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El UID debe ser un string' })
  @MaxLength(255, { message: 'El UID no puede exceder 255 caracteres' })
  uid?: string;

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
