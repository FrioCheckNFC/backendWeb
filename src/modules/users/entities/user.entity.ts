// Entidad User: representa la tabla "users" en PostgreSQL (Azure).
// Debe coincidir exactamente con las columnas de la tabla existente.
// Si se agrega o quita un @Column, hay que hacer una migracion en la BD.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum UserRole {
  VENDOR = 'VENDOR',
  TECHNICIAN = 'TECHNICIAN',
  DRIVER = 'DRIVER',
  RETAILER = 'RETAILER',
  SUPPORT = 'SUPPORT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Entity('users') 
export class User {
  // Clave primaria UUID generada automaticamente por PostgreSQL
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK al tenant. Cada usuario pertenece a un tenant (multi-tenant)
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Email unico, se usa para login
  @Column({ unique: true })
  email: string;

  // RUT del usuario (documento de identidad)
  @Column({ nullable: true })
  rut: string;

  // Hash bcrypt de la contrasena. Nunca se guarda en texto plano.
  @Column({ name: 'password_hash' })
  passwordHash: string;

  // Nombre del usuario
  @Column({ name: 'first_name' })
  firstName: string;

  // Apellido del usuario
  @Column({ name: 'last_name' })
  lastName: string;

  // Telefono (opcional)
  @Column({ nullable: true })
  phone: string;

  // Rol del usuario: ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER (ENUM)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.VENDOR })
  role: UserRole;

  // Tokens FCM para notificaciones push (opcional)
  @Column({ name: 'fcm_tokens', type: 'text', nullable: true })
  fcmTokens: string;

  // Si es false, el usuario no puede hacer login
  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Timestamps automaticos
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft delete: no se borra de la BD, solo se marca con fecha
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
