import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEvidence, EntityType } from './entities/media-evidence.entity';
import { AzureBlobStorageService } from './services/azure-blob-storage.service';
import {
  RequestPresignedUrlDto,
  ConfirmUploadDto,
  MediaResponseDto,
  PresignedUrlResponseDto,
  ConfirmUploadResponseDto,
} from './dto';

interface MediaFilters {
  skip?: number;
  take?: number;
  entityType?: EntityType;
  status?: string;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEvidence)
    private mediaEvidenceRepo: Repository<MediaEvidence>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  /**
   * Solicitar URL presignada para subir archivo
   */
  async requestPresignedUrl(
    requestDto: RequestPresignedUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    // Validar tamaño máximo (100 MB)
    const maxSizeBytes = 100 * 1024 * 1024;
    if (requestDto.fileSizeBytes > maxSizeBytes) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de 100 MB`,
      );
    }

    // Generar nombre único para el blob
    const blobName = this.generateBlobName(
      requestDto.tenantId,
      requestDto.entityType,
      requestDto.entityId,
      requestDto.fileName,
    );

    // Generar URL presignada
    const { url, expiresAt } = await this.azureBlobStorageService.generatePresignedUrl(
      blobName,
      30, // 30 minutos de expiración
    );

    // Crear registro en BD con estado "pending"
    const mediaEvidence = this.mediaEvidenceRepo.create({
      tenantId: requestDto.tenantId,
      entityType: requestDto.entityType,
      entityId: requestDto.entityId,
      blobName,
      blobUrl: this.azureBlobStorageService.getBlobUrl(blobName),
      mimeType: requestDto.mimeType,
      fileSizeBytes: requestDto.fileSizeBytes,
      uploadedBy: requestDto.uploadedBy,
      description: requestDto.description,
      presignedUrl: url,
      presignedUrlExpiresAt: expiresAt,
      status: 'pending',
    });

    const savedMedia = await this.mediaEvidenceRepo.save(mediaEvidence);

    const expiresInSeconds = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000,
    );

    return {
      mediaId: savedMedia.id,
      presignedUrl: url,
      expiresInSeconds,
    };
  }

  /**
   * Confirmar que el archivo fue subido correctamente
   */
  async confirmUpload(
    confirmDto: ConfirmUploadDto,
  ): Promise<ConfirmUploadResponseDto> {
    // Buscar el media
    const media = await this.mediaEvidenceRepo.findOne({
      where: { id: confirmDto.mediaId, tenantId: confirmDto.tenantId },
    });

    if (!media) {
      throw new NotFoundException(`Media con ID ${confirmDto.mediaId} no encontrada`);
    }

    if (media.status !== 'pending') {
      throw new BadRequestException(
        `No se puede confirmar un media que ya está en estado ${media.status}`,
      );
    }

    // Verificar que el blob existe en Azure (simulado)
    const exists = await this.azureBlobStorageService.blobExists(media.blobName);
    if (!exists) {
      throw new BadRequestException(
        `El archivo no fue encontrado en el almacenamiento`,
      );
    }

    // Actualizar estado a "confirmed"
    media.status = 'confirmed';
    media.presignedUrl = null; // Limpiar URL presignada de escritura

    const updatedMedia = await this.mediaEvidenceRepo.save(media);

    // Generar URL presignada para descarga
    const { url: downloadUrl, expiresAt } =
      await this.azureBlobStorageService.generateDownloadPresignedUrl(
        media.blobName,
      );

    updatedMedia.presignedUrl = downloadUrl;
    updatedMedia.presignedUrlExpiresAt = expiresAt;
    await this.mediaEvidenceRepo.save(updatedMedia);

    return {
      mediaId: updatedMedia.id,
      status: updatedMedia.status,
      blobUrl: updatedMedia.blobUrl,
      uploadedAt: updatedMedia.uploadedAt,
    };
  }

  /**
   * Obtener todos los media de una entidad
   */
  async findByEntity(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<MediaResponseDto[]> {
    const mediaList = await this.mediaEvidenceRepo.find({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      order: { uploadedAt: 'DESC' },
    });

    return mediaList.map(m => this.mapToResponse(m));
  }

  /**
   * Obtener todos los media con filtros
   */
  async findAll(
    tenantId: string,
    filters: MediaFilters,
  ): Promise<{ media: MediaResponseDto[]; total: number }> {
    const query = this.mediaEvidenceRepo.createQueryBuilder('media');

    query.where('media.tenantId = :tenantId', { tenantId });

    if (filters.entityType) {
      query.andWhere('media.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.status) {
      query.andWhere('media.status = :status', { status: filters.status });
    }

    const total = await query.getCount();

    const skip = filters.skip || 0;
    const take = filters.take || 20;
    query.skip(skip).take(take);
    query.orderBy('media.uploadedAt', 'DESC');

    const mediaList = await query.getMany();
    return {
      media: mediaList.map(m => this.mapToResponse(m)),
      total,
    };
  }

  /**
   * Obtener un media específico
   */
  async findOne(id: string, tenantId: string): Promise<MediaResponseDto> {
    const media = await this.mediaEvidenceRepo.findOne({
      where: { id, tenantId },
    });

    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrada`);
    }

    return this.mapToResponse(media);
  }

  /**
   * Eliminar un media
   */
  async delete(id: string, tenantId: string): Promise<{ message: string }> {
    const media = await this.mediaEvidenceRepo.findOne({
      where: { id, tenantId },
    });

    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrada`);
    }

    // Eliminar blob de Azure (simulado)
    await this.azureBlobStorageService.deleteBlob(media.blobName);

    // Soft delete del registro
    await this.mediaEvidenceRepo.softRemove(media);

    return { message: `Media ${id} eliminada correctamente` };
  }

  /**
   * Obtener URL de descarga para un media
   */
  async getDownloadUrl(
    id: string,
    tenantId: string,
  ): Promise<{ downloadUrl: string; expiresInSeconds: number }> {
    const media = await this.mediaEvidenceRepo.findOne({
      where: { id, tenantId },
    });

    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrada`);
    }

    if (media.status !== 'confirmed') {
      throw new BadRequestException(
        `No se puede descargar un media en estado ${media.status}`,
      );
    }

    const { url, expiresAt } =
      await this.azureBlobStorageService.generateDownloadPresignedUrl(
        media.blobName,
      );

    const expiresInSeconds = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000,
    );

    return {
      downloadUrl: url,
      expiresInSeconds,
    };
  }

  /**
   * Generar nombre de blob único y organizado
   */
  private generateBlobName(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
    fileName: string,
  ): string {
    const timestamp = new Date().getTime();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${tenantId}/${entityType}/${entityId}/${timestamp}-${sanitizedFileName}`;
  }

  /**
   * Mapear MediaEvidence a MediaResponseDto
   */
  private mapToResponse(media: MediaEvidence): MediaResponseDto {
    return {
      id: media.id,
      tenantId: media.tenantId,
      entityType: media.entityType,
      entityId: media.entityId,
      blobUrl: media.blobUrl,
      blobName: media.blobName,
      mimeType: media.mimeType,
      fileSizeBytes: media.fileSizeBytes,
      uploadedBy: media.uploadedBy,
      presignedUrl: media.presignedUrl,
      presignedUrlExpiresAt: media.presignedUrlExpiresAt,
      description: media.description,
      status: media.status,
      uploadedAt: media.uploadedAt,
      updatedAt: media.updatedAt,
    };
  }
}
