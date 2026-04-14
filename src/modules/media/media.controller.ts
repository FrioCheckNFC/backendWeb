import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  RequestPresignedUrlDto,
  ConfirmUploadDto,
  MediaResponseDto,
  PresignedUrlResponseDto,
  ConfirmUploadResponseDto,
} from './dto';
import { EntityType } from './entities/media-evidence.entity';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  /**
   * POST /media/presigned-url
   * Solicitar URL presignada para subir un archivo
   */
  @Post('presigned-url')
  @ApiOperation({
    summary: 'Obtener URL presignada para subir archivo a Azure Blob Storage',
  })
  @ApiResponse({
    status: 200,
    description: 'URL presignada generada',
    type: PresignedUrlResponseDto,
  })
  async requestPresignedUrl(
    @Body() requestDto: RequestPresignedUrlDto,
    @GetUser() user: User,
  ): Promise<PresignedUrlResponseDto> {
    requestDto.tenantId = user.tenantId;
    return this.mediaService.requestPresignedUrl(requestDto);
  }

  /**
   * POST /media/confirm
   * Confirmar que el archivo fue subido
   */
  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar carga de archivo' })
  @ApiResponse({
    status: 200,
    description: 'Carga confirmada',
    type: ConfirmUploadResponseDto,
  })
  async confirmUpload(
    @Body() confirmDto: ConfirmUploadDto,
    @GetUser() user: User,
  ): Promise<ConfirmUploadResponseDto> {
    confirmDto.tenantId = user.tenantId;
    return this.mediaService.confirmUpload(confirmDto);
  }

  /**
   * GET /media
   * Obtener todos los media con filtros
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los media' })
  @ApiQuery({
    name: 'entityType',
    required: false,
    enum: EntityType,
    description: 'Filtrar por tipo de entidad',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado (pending, confirmed, processed)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de media',
    schema: {
      properties: {
        media: { type: 'array', items: { $ref: '#/components/schemas/MediaResponseDto' } },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @GetUser() user: User,
    @Query('entityType') entityType?: EntityType,
    @Query('status') status?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.mediaService.findAll(user.tenantId, {
      entityType,
      status,
      skip,
      take,
    });
  }

  /**
   * GET /media/entity/:entityType/:entityId
   * Obtener media de una entidad específica
   */
  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Obtener media de una entidad' })
  @ApiResponse({
    status: 200,
    description: 'Media encontrada',
    type: [MediaResponseDto],
  })
  async findByEntity(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
    @GetUser() user: User,
  ): Promise<MediaResponseDto[]> {
    return this.mediaService.findByEntity(user.tenantId, entityType, entityId);
  }

  /**
   * GET /media/:id
   * Obtener un media específico
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un media específico' })
  @ApiResponse({
    status: 200,
    description: 'Media encontrada',
    type: MediaResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<MediaResponseDto> {
    return this.mediaService.findOne(id, user.tenantId);
  }

  /**
   * GET /media/:id/download
   * Obtener URL de descarga para un media
   */
  @Get(':id/download')
  @ApiOperation({ summary: 'Obtener URL de descarga presignada' })
  @ApiResponse({
    status: 200,
    description: 'URL de descarga generada',
    schema: {
      properties: {
        downloadUrl: { type: 'string' },
        expiresInSeconds: { type: 'number' },
      },
    },
  })
  async getDownloadUrl(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ downloadUrl: string; expiresInSeconds: number }> {
    return this.mediaService.getDownloadUrl(id, user.tenantId);
  }

  /**
   * DELETE /media/:id
   * Eliminar un media
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un media' })
  @ApiResponse({
    status: 200,
    description: 'Media eliminada',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.mediaService.delete(id, user.tenantId);
  }
}
