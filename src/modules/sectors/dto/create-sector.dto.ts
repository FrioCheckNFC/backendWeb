import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateSectorDto {
  @ApiProperty({
    example: '89922b21-f473-4bea-a883-066440630b68',
    description: 'UUID del tenant (se asigna automáticamente desde el token)',
  })
  @IsOptional()
  @IsUUID('4')
  tenantId: string;

  @ApiProperty({
    example: 'Recoleta',
    description: 'Comuna del sector',
  })
  @IsNotEmpty({ message: 'La comuna es obligatoria' })
  @IsString()
  @MinLength(2, { message: 'La comuna debe tener al menos 2 caracteres' })
  @MaxLength(255, { message: 'La comuna no puede exceder 255 caracteres' })
  comuna: string;

  @ApiProperty({
    example: 'Región Metropolitana',
    description: 'Ciudad o región del sector',
  })
  @IsNotEmpty({ message: 'La ciudad/región es obligatoria' })
  @IsString()
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
  @MaxLength(255, { message: 'La ciudad no puede exceder 255 caracteres' })
  city: string;
}
