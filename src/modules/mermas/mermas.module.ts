import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merma } from './entities/merma.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Merma]), AuthModule],
  exports: [TypeOrmModule],
})
export class MermasModule {}
