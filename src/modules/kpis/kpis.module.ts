// filepath: src/modules/kpis/kpis.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kpi } from './entities/kpi.entity';
import { KpisController } from './kpis.controller';
import { KpisService } from './kpis.service';
import { AuthModule } from '../auth/auth.module';
import { Machine } from '../machines/entities/machine.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Visit } from '../visits/entities/visit.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kpi,
      Machine,
      Ticket,
      Visit,
      Sale,
      Inventory,
      Sector,
      Tenant,
      User,
    ]),
    AuthModule,
  ],
  controllers: [KpisController],
  providers: [KpisService],
  exports: [KpisService],
})
export class KpisModule {}
