import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaEvidence } from './entities/media-evidence.entity';
import { AzureBlobStorageService } from './services/azure-blob-storage.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEvidence]), AuthModule],
  providers: [MediaService, AzureBlobStorageService],
  controllers: [MediaController],
  exports: [MediaService, AzureBlobStorageService],
})
export class MediaModule {}
