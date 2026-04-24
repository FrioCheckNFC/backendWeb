import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un string' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un string' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser uno de: VENDOR, TECHNICIAN, DRIVER, RETAILER, SUPPORT, ADMIN' })
  role?: UserRole;

  @ApiProperty({
    example: '+56998765432',
    description: 'Teléfono del usuario',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  phone?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del tenant (solo SUPER_ADMIN puede cambiar)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El tenantId debe ser un UUID válido' })
  tenantId?: string;

  @IsOptional()
  @IsBoolean({ message: 'active debe ser un boolean' })
  active?: boolean;
}
