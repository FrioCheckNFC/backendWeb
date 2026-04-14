import { EntityType } from '../entities/media-evidence.entity';

export class MediaResponseDto {
  id: string;
  tenantId: string;
  entityType: EntityType;
  entityId: string;
  blobUrl: string;
  blobName: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedBy: string | null;
  presignedUrl: string | null;
  presignedUrlExpiresAt: Date | null;
  description: string | null;
  status: string;
  uploadedAt: Date;
  updatedAt: Date;
}

export class PresignedUrlResponseDto {
  mediaId: string;
  presignedUrl: string;
  expiresInSeconds: number;
}

export class ConfirmUploadResponseDto {
  mediaId: string;
  status: string;
  blobUrl: string;
  uploadedAt: Date;
}
