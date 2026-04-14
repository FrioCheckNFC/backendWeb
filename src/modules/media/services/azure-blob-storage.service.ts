import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio simulado para integración con Azure Blob Storage
 * En producción, se reemplazaría con @azure/storage-blob
 */
@Injectable()
export class AzureBlobStorageService {
  private readonly containerName: string;
  private readonly storageAccountName: string;
  private readonly storageAccountKey: string;

  constructor(private configService: ConfigService) {
    this.containerName = this.configService.get(
      'AZURE_BLOB_CONTAINER_NAME',
      'media-evidence',
    );
    this.storageAccountName = this.configService.get(
      'AZURE_STORAGE_ACCOUNT_NAME',
      'friocheck',
    );
    this.storageAccountKey = this.configService.get(
      'AZURE_STORAGE_ACCOUNT_KEY',
      'simulated-key',
    );
  }

  /**
   * Generar URL presignada para subir un archivo
   * En producción: generar usando BlobSasUrl con token SAS
   */
  async generatePresignedUrl(
    blobName: string,
    expirationMinutes: number = 30,
  ): Promise<{ url: string; expiresAt: Date }> {
    // Generar timestamp de expiración
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    // En producción, se usaría:
    // const sasUrl = await generateBlobSASUrl({
    //   containerName: this.containerName,
    //   blobName,
    //   expiresOn: expiresAt,
    //   permissions: BlobSASPermissions.parse("racwd") // read, add, create, write, delete
    // });

    // Simulación: construir URL presignada ficticia
    const presignedUrl = this.buildSimulatedSasUrl(blobName, expiresAt);

    return {
      url: presignedUrl,
      expiresAt,
    };
  }

  /**
   * Obtener URL pública del blob (después de subida confirmada)
   */
  getBlobUrl(blobName: string): string {
    return `https://${this.storageAccountName}.blob.core.windows.net/${this.containerName}/${blobName}`;
  }

  /**
   * Verificar si un blob existe en Azure (simulado)
   */
  async blobExists(blobName: string): Promise<boolean> {
    // En producción: usar containerClient.getBlobClient(blobName).exists()
    // Por ahora, simular que siempre existe después de 2 segundos
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  /**
   * Obtener metadatos del blob
   */
  async getBlobMetadata(
    blobName: string,
  ): Promise<{ size: number; contentType: string; etag: string }> {
    // En producción: usar containerClient.getBlobClient(blobName).getProperties()
    return {
      size: 0,
      contentType: 'application/octet-stream',
      etag: this.generateETag(),
    };
  }

  /**
   * Eliminar un blob
   */
  async deleteBlob(blobName: string): Promise<void> {
    // En producción: containerClient.getBlobClient(blobName).delete()
    console.log(`[SIMULATED] Deleting blob: ${blobName}`);
  }

  /**
   * Generar URL de descarga presignada
   */
  async generateDownloadPresignedUrl(
    blobName: string,
    expirationMinutes: number = 60,
  ): Promise<{ url: string; expiresAt: Date }> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    const presignedUrl = this.buildSimulatedSasUrl(blobName, expiresAt, 'read');

    return {
      url: presignedUrl,
      expiresAt,
    };
  }

  /**
   * Construir URL SAS simulada (para demostración)
   */
  private buildSimulatedSasUrl(
    blobName: string,
    expiresAt: Date,
    permissions: string = 'racwd',
  ): string {
    const baseUrl = this.getBlobUrl(blobName);
    const sasToken = this.generateSimulatedSasToken(expiresAt, permissions);
    return `${baseUrl}?${sasToken}`;
  }

  /**
   * Generar SAS token simulado
   */
  private generateSimulatedSasToken(expiresAt: Date, permissions: string): string {
    const expires = Math.floor(expiresAt.getTime() / 1000);
    const timestamp = Math.floor(Date.now() / 1000);

    // Token SAS simulado (en producción, se usaría crypto para generar un token real)
    const token = Buffer.from(
      `sv=2021-06-08&ss=bfqt&srt=sco&sp=${permissions}&se=${expiresAt.toISOString()}&st=${new Date(timestamp * 1000).toISOString()}&spr=https&sig=${this.generateRandomToken()}`,
    ).toString('base64');

    return `sv=2021-06-08&ss=bfqt&srt=sco&sp=${permissions}&se=${expiresAt.toISOString()}&sig=${token}`;
  }

  /**
   * Generar token aleatorio para SAS simulado
   */
  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generar ETag simulado
   */
  private generateETag(): string {
    return Buffer.from(Math.random().toString()).toString('base64');
  }
}
