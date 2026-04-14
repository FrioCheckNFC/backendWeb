// DTO para registrar un usuario nuevo.
// Se usa solo en desarrollo/setup. En produccion un admin crearia usuarios.

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsUUID, IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  // Email unico del usuario
  @ApiProperty({ example: 'tecnico@friocheck.com', description: 'Email del usuario' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  email!: string;

  // Contrasena en texto plano (se hashea antes de guardar)
  @ApiProperty({ example: 'miClave123', description: 'Contrasena' })
  @IsNotEmpty({ message: 'La contrasena es obligatoria' })
  @IsString()
  password!: string;

  // Nombre del usuario
  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  firstName!: string;

  // Apellido del usuario
  @ApiProperty({ example: 'Perez', description: 'Apellido del usuario' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  lastName!: string;

  // ID del tenant al que pertenece el usuario
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID del tenant' })
  @IsNotEmpty()
  @IsUUID()
  tenantId!: string;

  // Rol del usuario: ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER
  @ApiProperty({ enum: UserRole, example: 'TECHNICIAN', description: 'Rol del usuario' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(UserRole, { message: 'El rol debe ser uno de los valores permitidos' })
  role!: UserRole;
}
