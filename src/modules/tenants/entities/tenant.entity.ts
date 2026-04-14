// tenant.entity.ts
// Mapea la tabla "tenants" de Azure.
// Un tenant es una empresa/cliente que usa FrioCheck (ej: "SuperFrio", "FrioCheck Test")
// Cada usuario pertenece a un tenant (users.tenant_id -> tenants.id)

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nombre de la empresa
  @Column({ length: 255 })
  name: string;

  // Slug unico para identificar el tenant en URLs (ej: "superfrio")
  @Column({ length: 255, unique: true })
  slug: string;

  // Descripcion opcional de la empresa
  @Column({ type: 'text', nullable: true })
  description?: string;

  // URL del logo de la empresa
  @Column({ name: 'logo_url', type: 'varchar', nullable: true })
  logoUrl?: string;

  // Si el tenant esta activo o deshabilitado
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
