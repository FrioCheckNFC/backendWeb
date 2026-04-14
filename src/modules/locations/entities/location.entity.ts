import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('locations')
@Index(['tenantId', 'name'], { unique: true })
@Index(['tenantId'])
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant (multi-tenant)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Nombre de la ubicación (sucursal, centro de distribución, etc)
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

  // Nombre de contacto para la ubicación
  @Column({ name: 'contact_name', type: 'varchar', length: 255, nullable: true })
  contactName: string;

  // Teléfono de contacto (opcional)
  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  // Email de contacto (opcional)
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  // Descripción adicional
  @Column({ type: 'text', nullable: true })
  description: string;

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
