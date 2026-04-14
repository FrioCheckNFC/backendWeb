// change-password.dto.ts
// DTO para cambiar la contraseña del usuario autenticado

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  // Contraseña actual (para verificar que es el usuario)
  @ApiProperty({ example: 'contraseña_actual', description: 'Contraseña actual' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  @IsString()
  currentPassword!: string;

  // Nueva contraseña
  @ApiProperty({ example: 'nueva_contraseña_123', description: 'Nueva contraseña' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword!: string;

  // Confirmación de nueva contraseña
  @ApiProperty({ example: 'nueva_contraseña_123', description: 'Confirmar nueva contraseña' })
  @IsNotEmpty({ message: 'La confirmación es obligatoria' })
  @IsString()
  confirmPassword!: string;
}
