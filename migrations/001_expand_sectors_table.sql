-- Migración: Expandir tabla sectors para locales físicos completos
-- Fecha: 2026-04-07
-- Descripción: Convierte sectors en tabla completa de locales físicos con datos de encargado, dirección, GPS, etc.

BEGIN;

-- Agregar columnas de datos físicos
ALTER TABLE sectors ADD COLUMN address TEXT NULL;
ALTER TABLE sectors ADD COLUMN latitude DECIMAL(10, 8) NULL;
ALTER TABLE sectors ADD COLUMN longitude DECIMAL(11, 8) NULL;

-- Agregar columnas de contacto (encargado)
ALTER TABLE sectors ADD COLUMN contact_name VARCHAR(255) NULL;
ALTER TABLE sectors ADD COLUMN phone VARCHAR(20) NULL;
ALTER TABLE sectors ADD COLUMN email VARCHAR(255) NULL;

-- Agregar columna de relación con usuario encargado
ALTER TABLE sectors ADD COLUMN contact_user_id UUID NULL;

-- Agregar constraint de clave foránea 
ALTER TABLE sectors ADD CONSTRAINT fk_sectors_contact_user
  FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Agregar columnas de visualización
ALTER TABLE sectors ADD COLUMN color VARCHAR(7) NULL;
ALTER TABLE sectors ADD COLUMN icon VARCHAR(255) NULL;
ALTER TABLE sectors ADD COLUMN "order" INT DEFAULT 0 NOT NULL;

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_sectors_tenant_order ON sectors(tenant_id, "order");
CREATE INDEX idx_sectors_address ON sectors(tenant_id, address) WHERE deleted_at IS NULL;
CREATE INDEX idx_sectors_contact ON sectors(tenant_id, contact_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_sectors_contact_user ON sectors(contact_user_id);

COMMIT;
