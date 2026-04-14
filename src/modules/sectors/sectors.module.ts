import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectorsService } from './sectors.service';
import { SectorsController } from './sectors.controller';
import { Sector } from './entities/sector.entity';
import { Machine } from '../machines/entities/machine.entity';
import { NfcTag } from '../nfc-tags/entities/nfc-tag.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sector, Machine, NfcTag, User]),
    AuthModule,
  ],
  providers: [SectorsService],
  controllers: [SectorsController],
  exports: [SectorsService],
})
export class SectorsModule {}
