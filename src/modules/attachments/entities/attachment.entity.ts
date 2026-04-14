import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum AttachmentType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  REPORT = 'REPORT',
  OTHER = 'OTHER',
}

export enum AttachmentCategory {
  EVIDENCE = 'EVIDENCE',
  SIGNATURE = 'SIGNATURE',
  INVOICE = 'INVOICE',
  TECHNICAL = 'TECHNICAL',
  INSPECTION = 'INSPECTION',
  OTHER = 'OTHER',
}

@Entity('attachments')
@Index(['tenantId', 'uploadedById'])
@Index(['tenantId', 'visitId'])
@Index(['tenantId', 'workOrderId'])
@Index(['tenantId', 'ticketId'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // FK al usuario que subió el archivo
  @Column({ name: 'uploaded_by_id', type: 'uuid' })
  uploadedById: string;

  // FK a visita (opcional)
  @Column({ name: 'visit_id', type: 'uuid', nullable: true })
  visitId: string;

  // FK a work order (opcional)
  @Column({ name: 'work_order_id', type: 'uuid', nullable: true })
  workOrderId: string;

  // FK a ticket (opcional)
  @Column({ name: 'ticket_id', type: 'uuid', nullable: true })
  ticketId: string;

  // Tipo de archivo
  @Column({
    type: 'enum',
    enum: AttachmentType,
    default: AttachmentType.PHOTO,
  })
  type: AttachmentType;

  // Categoría
  @Column({
    type: 'enum',
    enum: AttachmentCategory,
    default: AttachmentCategory.EVIDENCE,
  })
  category: AttachmentCategory;

  // Nombre del archivo
  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  // Tamaño del archivo en bytes
  @Column({ name: 'file_size_bytes', type: 'bigint' })
  fileSizeBytes: number;

  // Tipo MIME
  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  // URL del blob en Azure Storage
  @Column({ name: 'azure_blob_url', type: 'varchar', length: 2048 })
  azureBlobUrl: string;

  // Descripción del archivo
  @Column({ type: 'text', nullable: true })
  description: string;

  // Metadatos adicionales (JSON)
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
