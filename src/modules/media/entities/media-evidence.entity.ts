import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum EntityType {
  VISIT = 'VISIT',
  TICKET = 'TICKET',
  ORDER = 'ORDER',
}

@Entity('media_evidence')
@Index(['tenantId', 'entityType', 'entityId'])
@Index(['tenantId', 'uploadedAt'])
export class MediaEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant (multi-tenant)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Tipo de entidad a la que pertenece esta evidencia
  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  // ID de la entidad (ej: ID de Visit, Ticket, etc)
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  // URL del blob en Azure Storage
  @Column({ name: 'blob_url', type: 'varchar', length: 2048 })
  blobUrl: string;

  // Nombre del blob/archivo
  @Column({ name: 'blob_name', type: 'varchar', length: 255 })
  blobName: string;

  // Tipo MIME (image/jpeg, application/pdf, etc)
  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  // Tamaño del archivo en bytes
  @Column({ name: 'file_size_bytes', type: 'bigint' })
  fileSizeBytes: number;

  // Usuario que subió el archivo
  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy: string | null;

  // URL presignada (temporal, para descarga)
  @Column({
    name: 'presigned_url',
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  presignedUrl: string | null;

  // Fecha de expiración de la URL presignada
  @Column({ name: 'presigned_url_expires_at', type: 'timestamp', nullable: true })
  presignedUrlExpiresAt: Date | null;

  // Descripción de la evidencia
  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Estado: pendiente, confirmado, procesado
  @Column({ name: 'status', type: 'varchar', length: 50, default: 'pending' })
  status: string; // pending, confirmed, processed

  // Timestamps automáticos
  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
