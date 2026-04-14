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

@Entity('nfc_tags')
@Index(['tenantId', 'machineId'])
@Index(['tenantId', 'uid'], { unique: true })
export class NfcTag {
  @ApiProperty({
    description: 'ID único del tag NFC (UUID)',
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
    description: 'ID de la máquina asociada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  @ApiProperty({
    description: 'UID único del tag NFC',
    example: 'NFC-00A1B2C3D4E5F6G7',
  })
  @Column({ type: 'varchar', length: 255 })
  uid: string;

  @ApiProperty({
    description: 'Modelo del tag NFC',
    example: 'MIFARE Classic 1K',
    nullable: true,
  })
  @Column({ name: 'tag_model', type: 'varchar', length: 255, nullable: true })
  tagModel: string;

  @ApiProperty({
    description: 'Modelo del hardware lector',
    example: 'ACR122U',
    nullable: true,
  })
  @Column({ name: 'hardware_model', type: 'varchar', length: 255, nullable: true })
  hardwareModel: string;

  @ApiProperty({
    description: 'ID de serie de la máquina del tag',
    example: 'SER-123456789',
    nullable: true,
  })
  @Column({ name: 'machine_serial_id', type: 'varchar', length: 255, nullable: true })
  machineSerialId: string;

  @ApiProperty({
    description: 'Tenant ID ofuscado para seguridad',
    example: 'TEN-OBFXYZ123',
    nullable: true,
  })
  @Column({ name: 'tenant_id_obfuscated', type: 'varchar', length: 255, nullable: true })
  tenantIdObfuscated: string;

  @ApiProperty({
    description: 'Checksum de integridad del tag',
    example: 'CRC32-ABC123DEF',
    nullable: true,
  })
  @Column({ name: 'integrity_checksum', type: 'varchar', length: 255, nullable: true })
  integrityChecksum: string;

  @ApiProperty({
    description: 'Si el tag está bloqueado',
    example: false,
  })
  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked: boolean;

  @ApiProperty({
    description: 'Si el tag está activo',
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
