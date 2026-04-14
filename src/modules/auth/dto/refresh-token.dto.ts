// refresh-token.dto.ts
// DTO para renovar el JWT

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  // El token actual (para validar que es válido)
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5...', description: 'Token actual' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @IsString()
  accessToken!: string;
}
