import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('stores')
@Index(['tenantId', 'name'], { unique: true })
@Index(['tenantId'])
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant (multi-tenant)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string;

  @Column({ name: 'retailer_id', type: 'uuid', nullable: true })
  retailerId: string;

  // Nombre del local
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Dirección física
  @Column({ type: 'text' })
  address: string;

  // Coordenada de latitud
  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude: number;

  // Coordenada de longitud
  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude: number;

  @Column({ name: 'retailer_name', type: 'varchar', length: 255, nullable: true })
  retailerName: string;

  @Column({ name: 'retailer_rut', type: 'varchar', length: 20, nullable: true })
  retailerRut: string;

  @Column({ name: 'retailer_phone', type: 'varchar', length: 20, nullable: true })
  retailerPhone: string;

  @Column({ name: 'retailer_email', type: 'varchar', length: 255, nullable: true })
  retailerEmail: string;

  // Indicador de ubicación activa
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Timestamps automáticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
