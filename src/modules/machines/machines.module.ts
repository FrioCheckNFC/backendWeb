import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Machine } from './entities/machine.entity';
import { MachineHistory } from './entities/machine-history.entity';
import { Location } from '../locations/entities/location.entity';
import { User } from '../users/entities/user.entity';
import { MachinesService } from './machines.service';
import { MachinesController } from './machines.controller';

// Módulo Machines - Gestión de máquinas refrigeradas
@Module({
  imports: [TypeOrmModule.forFeature([Machine, MachineHistory, Location, User]), AuthModule],
  providers: [MachinesService],
  controllers: [MachinesController],
  exports: [MachinesService],
})
export class MachinesModule {}
