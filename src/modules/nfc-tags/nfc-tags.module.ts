import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfcTag } from './entities/nfc-tag.entity';
import { Machine } from '../machines/entities/machine.entity';
import { AuthModule } from '../auth/auth.module';
import { NfcTagsService } from './nfc-tags.service';
import { NfcTagsController } from './nfc-tags.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NfcTag, Machine]), AuthModule],
  providers: [NfcTagsService],
  controllers: [NfcTagsController],
  exports: [NfcTagsService, TypeOrmModule],
})
export class NfcTagsModule {}
