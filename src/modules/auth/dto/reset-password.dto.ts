// reset-password.dto.ts
// DTO para resetear contraseña con token

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  // Token enviado por email
  @ApiProperty({ example: 'token_enviado_por_email', description: 'Token de recuperación' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @IsString()
  token!: string;

  // Nueva contraseña
  @ApiProperty({ example: 'nueva_contraseña_123', description: 'Nueva contraseña' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword!: string;

  // Confirmación
  @ApiProperty({ example: 'nueva_contraseña_123', description: 'Confirmar nueva contraseña' })
  @IsNotEmpty({ message: 'La confirmación es obligatoria' })
  @IsString()
  confirmPassword!: string;
}
