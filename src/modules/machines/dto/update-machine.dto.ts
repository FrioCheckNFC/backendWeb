import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MachineStatus } from '../entities/machine.entity';

export class UpdateMachineDto {
  @ApiProperty({
    description: 'Número de serie de la máquina',
    example: 'SN-RF-00001',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El número de serie debe ser un string' })
  @MaxLength(255, { message: 'El número de serie no puede exceder 255 caracteres' })
  serialNumber?: string;

  @ApiProperty({
    description: 'Modelo de la máquina',
    example: 'Refrigerador Samsung RF28',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El modelo debe ser un string' })
  @MaxLength(255, { message: 'El modelo no puede exceder 255 caracteres' })
  model?: string;

  @ApiProperty({
    description: 'Marca de la máquina',
    example: 'Samsung',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser un string' })
  @MaxLength(255, { message: 'La marca no puede exceder 255 caracteres' })
  brand?: string;

  @ApiProperty({
    description: 'Nombre de la ubicación',
    example: 'Almacén Central',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre de ubicación debe ser un string' })
  @MaxLength(255, { message: 'El nombre de ubicación no puede exceder 255 caracteres' })
  locationName?: string;

  @ApiProperty({
    description: 'Latitud de la ubicación',
    example: -34.55568662,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @IsLatitude({ message: 'La latitud debe estar entre -90 y 90' })
  locationLat?: number;

  @ApiProperty({
    description: 'Longitud de la ubicación',
    example: -58.36408539,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @IsLongitude({ message: 'La longitud debe estar entre -180 y 180' })
  locationLng?: number;

  @ApiProperty({
    description: 'Estado de la máquina',
    enum: MachineStatus,
    example: MachineStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(MachineStatus, {
    message: 'El estado debe ser uno de: ACTIVE, INACTIVE, IN_TRANSIT, MAINTENANCE, DECOMMISSIONED',
  })
  status?: MachineStatus;

  @ApiProperty({
    description: 'ID del usuario asignado a la máquina',
    example: 'cfe41b62-9b35-4e8d-9a4f-4a7789a41320',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El assignedUserId debe ser un UUID válido' })
  assignedUserId?: string;

  @ApiProperty({
    description: 'ID de la tienda donde está ubicada la máquina',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El storeId debe ser un UUID válido' })
  storeId?: string;

  @ApiProperty({
    description: 'Indica si la máquina está activa',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El isActive debe ser boolean' })
  isActive?: boolean;
}
