import {
  IsEmail,
  IsString,
  IsEnum,
  IsUUID,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  VENDOR = 'VENDOR',
  TECHNICIAN = 'TECHNICIAN',
  DRIVER = 'DRIVER',
  RETAILER = 'RETAILER',
  SUPPORT = 'SUPPORT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña del usuario',
  })
  @IsString({ message: 'La contraseña debe ser un string' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString({ message: 'El nombre debe ser un string' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  firstName!: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @IsString({ message: 'El apellido debe ser un string' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  lastName!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.VENDOR,
    description: 'Rol del usuario',
  })
  @IsEnum(UserRole, { message: 'El rol debe ser uno de: VENDOR, TECHNICIAN, DRIVER, RETAILER, SUPPORT, ADMIN' })
  role!: UserRole;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del tenant (se obtiene automáticamente del usuario autenticado si no se proporciona)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El tenantId debe ser un UUID válido' })
  tenantId?: string;

  @ApiProperty({
    example: '+56998765432',
    description: 'Teléfono del usuario',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  phone?: string;
}
