-- Migración: Agregar sector_id a tabla machines
-- Fecha: 2026-04-08
-- Descripción: Agrega la columna sector_id para relacionar máquinas con sectores/locales

BEGIN;

-- Agregar columna sector_id a machines
ALTER TABLE machines ADD COLUMN sector_id UUID NULL;

-- Crear constraint de clave foránea hacia sectors
ALTER TABLE machines ADD CONSTRAINT fk_machines_sector
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL;

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_machines_tenant_sector ON machines(tenant_id, sector_id);
CREATE INDEX idx_machines_sector_deleted ON machines(sector_id) WHERE deleted_at IS NULL;

COMMIT;
