import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { EntityType } from '../entities/media-evidence.entity';

export class RequestPresignedUrlDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del tenant (se obtiene automáticamente del usuario autenticado)',
  })
  @IsOptional()
  @IsUUID('4')
  tenantId!: string;

  @ApiProperty({
    enum: EntityType,
    example: EntityType.VISIT,
    description: 'Tipo de entidad (VISIT, TICKET, ORDER)',
  })
  @IsNotEmpty()
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID de la entidad (visita, ticket, orden)',
  })
  @IsNotEmpty()
  @IsUUID('4')
  entityId: string;

  @ApiProperty({
    example: 'photo.jpg',
    description: 'Nombre del archivo a subir',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'Tipo MIME del archivo',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  mimeType: string;

  @ApiProperty({
    example: 2048576,
    description: 'Tamaño del archivo en bytes',
  })
  @IsNotEmpty()
  fileSizeBytes: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'UUID del usuario que sube el archivo',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  uploadedBy: string;

  @ApiProperty({
    example: 'Foto del daño en el compresor',
    description: 'Descripción de la evidencia',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description: string;
}
