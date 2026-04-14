import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  IsBoolean,
} from 'class-validator';
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

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  phone?: string;

  @IsOptional()
  @IsBoolean({ message: 'active debe ser un boolean' })
  active?: boolean;
}
