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

@Entity('sectors')
@Index(['tenantId'])
@Index(['tenantId', 'comuna'])
@Index(['tenantId', 'city'])
export class Sector {
  @ApiProperty({
    description: 'ID único del sector (UUID)',
    example: 'ac6fd307-feaf-4025-b148-77273aaf7902',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del tenant (multi-tenant)',
    example: '89922b21-f473-4bea-a883-066440630b68',
  })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ApiProperty({
    description: 'Nombre del tenant',
    example: 'SuperFrio Refrigeración',
  })
  @Column({ name: 'tenant_name', type: 'varchar', length: 255, nullable: true })
  tenantName: string;

  @ApiProperty({
    description: 'Dirección del sector',
    example: 'Bombero Ramón Cornejo Núñez 150-32, Recoleta, Región Metropolitana',
  })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({
    description: 'Latitud GPS',
    example: -33.39945100,
    nullable: true,
  })
  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitud GPS',
    example: -70.62863800,
    nullable: true,
  })
  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude: number;

  @ApiProperty({
    description: 'Comuna del sector',
    example: 'Recoleta',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  comuna: string;

  @ApiProperty({
    description: 'Ciudad o región del sector',
    example: 'Región Metropolitana',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @ApiProperty({
    description: 'Si el sector está activo',
    example: true,
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-04-09T18:57:39.775256Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-04-09T18:57:39.775256Z',
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
