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

@Entity('sales')
@Index(['tenantId', 'vendorId'])
@Index(['tenantId', 'sectorId'])
@Index(['tenantId', 'machineId'])
@Index(['tenantId', 'saleDate'])
export class Sale {
  @ApiProperty({
    description: 'ID único de la venta',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del tenant (se asigna automáticamente)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ApiProperty({
    description: 'ID del vendedor/usuario que realiza la venta (user con role VENDOR)',
    example: '660e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  @Column({ name: 'vendor_id', type: 'uuid', nullable: true })
  vendorId: string | null;

  @ApiProperty({
    description: 'ID del sector/local donde se realiza la venta',
    example: '770e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string | null;

  @ApiProperty({
    description: 'ID de la maquina asociada a la venta',
    example: '880e8400-e29b-41d4-a716-446655440004',
    nullable: true,
  })
  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId: string | null;

  @ApiProperty({
    description: 'Monto total de la venta (suma de todos los items)',
    example: 150000.75,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @ApiProperty({
    description: 'Descripción o notas de la venta',
    example: 'Venta de productos variados',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Fecha y hora en que se realizó la venta',
    example: '2026-04-08T15:30:00Z',
  })
  @Column({ name: 'sale_date', type: 'timestamp' })
  saleDate!: Date;

  @ApiProperty({
    description: 'Nombre del tenant',
    example: 'SuperFrio Refrigeracion',
    nullable: true,
  })
  @Column({ name: 'tenant_name', type: 'varchar', length: 255, nullable: true })
  tenantName: string | null;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null = null;
}
