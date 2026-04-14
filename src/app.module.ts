import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { MachinesModule } from './modules/machines/machines.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { VisitsModule } from './modules/visits/visits.module';
import { MediaModule } from './modules/media/media.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { NfcTagsModule } from './modules/nfc-tags/nfc-tags.module';
import { SectorsModule } from './modules/sectors/sectors.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { MermasModule } from './modules/mermas/mermas.module';
import { KpisModule } from './modules/kpis/kpis.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { SyncQueueModule } from './modules/sync-queue/sync-queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: config.get('DB_HOST', '').includes('azure.com')
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),

    AuthModule,
    TenantsModule,
    UsersModule,
    MachinesModule,
    TicketsModule,
    VisitsModule,
    MediaModule,
    DashboardModule,
    NotificationsModule,
    AttachmentsModule,
    NfcTagsModule,
    SectorsModule,
    WorkOrdersModule,
    MermasModule,
    KpisModule,
    InventoryModule,
    SalesModule,
    SyncQueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}