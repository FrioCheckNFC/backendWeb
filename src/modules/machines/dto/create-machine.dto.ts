import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MachineStatus } from '../entities/machine.entity';

export class CreateMachineDto {
  @ApiProperty({
    description: 'UUID del tenant (se obtiene automáticamente del usuario autenticado)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El tenantId debe ser un UUID válido' })
  tenantId?: string;

  @ApiProperty({
    description: 'Número de serie único de la máquina',
    example: 'SN-2024-001',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'El número de serie debe ser un string' })
  @MinLength(3, { message: 'El número de serie debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El número de serie no puede exceder 255 caracteres' })
  serialNumber: string;

  @ApiProperty({
    description: 'Modelo de la máquina',
    example: 'Vending Machine Pro V2',
    minLength: 2,
    maxLength: 255,
  })
  @IsString({ message: 'El modelo debe ser un string' })
  @MinLength(2, { message: 'El modelo debe tener al menos 2 caracteres' })
  @MaxLength(255, { message: 'El modelo no puede exceder 255 caracteres' })
  model: string;

  @ApiProperty({
    description: 'Marca de la máquina',
    example: 'VendTech',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser un string' })
  @MaxLength(255, { message: 'La marca no puede exceder 255 caracteres' })
  brand?: string;

  @ApiProperty({
    description: 'Estado de la máquina',
    enum: MachineStatus,
    example: MachineStatus.ACTIVE,
  })
  @IsEnum(MachineStatus, {
    message: 'El estado debe ser uno de: ACTIVE, INACTIVE, IN_TRANSIT, MAINTENANCE, DECOMMISSIONED',
  })
  status: MachineStatus;

  @ApiProperty({
    description: 'Nombre de la ubicación de la máquina',
    example: 'Centro Comercial Plaza Mayor - Piso 1',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre de ubicación debe ser un string' })
  @MaxLength(255, { message: 'El nombre de ubicación no puede exceder 255 caracteres' })
  locationName?: string;

  @ApiProperty({
    description: 'Latitud GPS de la ubicación',
    example: 40.41678,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  locationLat?: number;

  @ApiProperty({
    description: 'Longitud GPS de la ubicación',
    example: -3.70379,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  locationLng?: number;

  @ApiProperty({
    description: 'UID del NFC asociado',
    example: 'NFC-00A1B2C3D4',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El UID del NFC debe ser un string' })
  @MaxLength(255, { message: 'El UID del NFC no puede exceder 255 caracteres' })
  nfcUid?: string;

  @ApiProperty({
    description: 'UUID del tag NFC',
    example: '770e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El nfcTagId debe ser un UUID válido' })
  nfcTagId?: string;

  @ApiProperty({
    description: 'Fecha de instalación (formato ISO 8601)',
    example: '2024-04-01T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de instalación debe ser una fecha válida (ISO 8601)' })
  installedAt?: string;

  @ApiProperty({
    description: 'Descripción adicional de la máquina',
    example: 'Máquina de vending ubicada en entrada principal',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  description?: string;

  @ApiProperty({
    description: 'UUID de la tienda donde se ubica la máquina',
    example: 'a7541a77-9af6-4d45-a9c2-b7415b572584',
  })
  @IsUUID('4', { message: 'El storeId debe ser un UUID válido' })
  storeId: string;

  @ApiProperty({
    description: 'Indica si la máquina está activa',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El isActive debe ser boolean' })
  isActive?: boolean;
}
