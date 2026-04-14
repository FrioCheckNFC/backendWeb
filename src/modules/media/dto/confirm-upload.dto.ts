import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, MaxLength, IsOptional } from 'class-validator';

export class ConfirmUploadDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del media que fue subido',
  })
  @IsNotEmpty()
  @IsUUID('4')
  mediaId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'UUID del tenant (se obtiene automáticamente del usuario autenticado)',
  })
  @IsOptional()
  @IsUUID('4')
  tenantId!: string;

  @ApiProperty({
    example: 'abc123def456xyz789...',
    description: 'Hash SHA256 del archivo (para verificación)',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  fileSha256: string;
}
