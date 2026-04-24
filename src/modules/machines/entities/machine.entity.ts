import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MachineStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  IN_TRANSIT = 'IN_TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

@Entity('machines')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'assignedUserId'])
@Index(['tenantId', 'storeId'])
@Index(['tenantId', 'sectorId'])
@Index(['tenantId', 'serialNumber'], { unique: true })
export class Machine {
  @ApiProperty({
    description: 'ID único de la máquina (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del tenant (multi-tenant)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ApiProperty({
    description: 'ID del usuario asignado a la máquina',
    example: '660e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @Column({ name: 'assigned_user_id', type: 'uuid', nullable: true })
  assignedUserId: string;

  @ApiProperty({
    description: 'ID de la tienda donde está la máquina',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @Column({ name: 'store_id', type: 'uuid', nullable: true })
  storeId: string;

  @ApiProperty({
    description: 'ID del sector (región/comuna) donde está la máquina',
    example: 'ac6fd307-feaf-4025-b148-77273aaf7902',
    nullable: true,
  })
  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string;

  @ApiProperty({
    description: 'Nombre de la tienda (resuelto desde store_id)',
    example: 'SuperFrio Refrigeración',
    nullable: true,
  })
  storeName?: string;

  @ApiProperty({
    description: 'Número de serie único de la máquina',
    example: 'SN-2024-001',
  })
  @Column({ name: 'serial_number', type: 'varchar', length: 255 })
  serialNumber: string;

  @ApiProperty({
    description: 'Modelo de la máquina',
    example: 'Vending Machine Pro V2',
  })
  @Column({ name: 'model', type: 'varchar', length: 255 })
  model: string;

  @ApiProperty({
    description: 'Marca de la máquina',
    example: 'VendTech',
    nullable: true,
  })
  @Column({ name: 'brand', type: 'varchar', length: 255, nullable: true })
  brand: string;

  @ApiProperty({
    description: 'Nombre de la ubicación',
    example: 'Centro Comercial Plaza Mayor - Piso 1',
    nullable: true,
  })
  @Column({ name: 'location_name', type: 'varchar', length: 255, nullable: true })
  locationName: string;

  @ApiProperty({
    description: 'Latitud GPS de la ubicación',
    example: 40.41678,
    nullable: true,
  })
  @Column({
    name: 'location_lat',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  locationLat: number;

  @ApiProperty({
    description: 'Longitud GPS de la ubicación',
    example: -3.70379,
    nullable: true,
  })
  @Column({
    name: 'location_lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  locationLng: number;

  @ApiProperty({
    description: 'Estado de la máquina',
    enum: MachineStatus,
    example: MachineStatus.ACTIVE,
  })
  @Column({
    name: 'status',
    type: 'enum',
    enum: MachineStatus,
    default: MachineStatus.ACTIVE,
  })
  status: MachineStatus;

  @ApiProperty({
    description: 'Indica si la máquina está activa',
    example: true,
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-04-01T10:30:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-04-01T15:45:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Fecha de eliminación (soft delete)',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
