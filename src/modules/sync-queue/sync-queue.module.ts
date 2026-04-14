import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncQueue } from './entities/sync-queue.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([SyncQueue]), AuthModule],
  exports: [TypeOrmModule],
})
export class SyncQueueModule {}
