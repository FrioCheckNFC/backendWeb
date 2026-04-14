import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Machine } from '../../machines/entities/machine.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sectors')
@Index(['tenantId', 'name'], { unique: true })
@Index(['tenantId'])
@Index(['contactUserId'])
export class Sector {
  @ApiProperty({
    description: 'ID único del local (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========== DATOS BÁSICOS ==========
  @ApiProperty({
    description: 'ID del tenant (multi-tenant)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ApiProperty({
    description: 'Nombre del local (sucursal)',
    example: 'Bodegón El Sol',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Descripción del local',
    example: 'Sucursal principal con 12 máquinas',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  // ========== DATOS FÍSICOS ==========
  @ApiProperty({
    description: 'Dirección física del local',
    example: 'Av. Libertador 45, Este',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({
    description: 'Latitud GPS',
    example: -33.8688,
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
    example: -56.1636,
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

  // ========== DATOS DE CONTACTO (ENCARGADO) ==========
  @ApiProperty({
    description: 'Nombre del encargado/contacto del local',
    example: 'Roberto Díaz',
    nullable: true,
  })
  @Column({ name: 'contact_name', type: 'varchar', length: 255, nullable: true })
  contactName: string;

  @ApiProperty({
    description: 'Teléfono del encargado',
    example: '+56912345678',
    nullable: true,
  })
  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  @ApiProperty({
    description: 'Email del encargado',
    example: 'roberto@example.com',
    nullable: true,
  })
  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string;

  // ========== RELACIÓN CON ENCARGADO (USER) ==========
  @ApiProperty({
    description: 'ID del usuario encargado de este local',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @Column({ name: 'contact_user_id', type: 'uuid', nullable: true })
  contactUserId: string;

  @ApiProperty({
    description: 'Datos del usuario encargado',
    type: () => User,
    nullable: true,
  })
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'contact_user_id' })
  contactUser?: User;

  // ========== DATOS DE VISUALIZACIÓN ==========
  @ApiProperty({
    description: 'Color hexadecimal para UI',
    example: '#FF5733',
    nullable: true,
  })
  @Column({ name: 'color', type: 'varchar', length: 7, nullable: true })
  color: string;

  @ApiProperty({
    description: 'Ícono para UI (FontAwesome)',
    example: 'fas-store',
    nullable: true,
  })
  @Column({ name: 'icon', type: 'varchar', length: 255, nullable: true })
  icon: string;

  @ApiProperty({
    description: 'Orden de visualización',
    example: 1,
  })
  @Column({ name: 'order', type: 'int', default: 0 })
  order: number;

  // ========== ESTADO ==========
  @ApiProperty({
    description: 'Si el local está activo',
    example: true,
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // ========== TIMESTAMPS ==========
  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-04-01T10:30:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-04-07T15:45:00Z',
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

  // ========== RELACIONES ==========
  @ApiProperty({
    description: 'Máquinas asignadas a este local',
    type: () => Machine,
    isArray: true,
  })
  @OneToMany(() => Machine, (machine) => machine.sector, { lazy: true })
  machines?: Machine[];
}
