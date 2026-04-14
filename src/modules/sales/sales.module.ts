import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleInventoryItem } from './entities/sale-inventory-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { AuthModule } from '../auth/auth.module';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleInventoryItem, Inventory]),
    AuthModule,
  ],
  providers: [SalesService],
  controllers: [SalesController],
  exports: [SalesService, TypeOrmModule],
})
export class SalesModule {}
