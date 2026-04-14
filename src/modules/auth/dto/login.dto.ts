// DTO = Data Transfer Object.
// Define la forma exacta del JSON que el frontend manda al endpoint POST /auth/login.
// Los decoradores @IsNotEmpty y @IsString validan automaticamente
// y rechazan el request si faltan campos o tienen tipo incorrecto.

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginDto {
  // Email del usuario (campo unico en la BD, se usa para login)
  @ApiProperty({ example: 'admin@friocheck.com', description: 'Email del usuario' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  email!: string;

  // Contrasena en texto plano (se compara contra el hash en la BD)
  @ApiProperty({ example: 'miClave123', description: 'Contrasena del usuario' })
  @IsNotEmpty({ message: 'La contrasena es obligatoria' })
  @IsString()
  password!: string;
}