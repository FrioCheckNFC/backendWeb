// forgot-password.dto.ts
// DTO para solicitar recuperación de contraseña

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  // Email del usuario
  @ApiProperty({ example: 'usuario@example.com', description: 'Email del usuario' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;
}
