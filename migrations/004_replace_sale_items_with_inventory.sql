-- Migración: Reemplazar sale_items con tabla de unión a inventory
-- Fecha: 2026-04-08
-- Descripción: Elimina la tabla sale_items y crea sale_inventory_items para relacionar sales con inventory

BEGIN;

-- ============================================
-- ELIMINAR TABLA SALE_ITEMS (si existe)
-- ============================================
DROP TABLE IF EXISTS sale_items CASCADE;

-- ============================================
-- CREAR TABLA SALE_INVENTORY_ITEMS (TABLA DE UNIÓN)
-- ============================================
CREATE TABLE IF NOT EXISTS sale_inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  sale_id UUID NOT NULL,
  inventory_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price_override DECIMAL(12, 2),
  discount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  CONSTRAINT fk_sale_inventory_items_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_sale_inventory_items_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE RESTRICT
);

-- Crear índices para sale_inventory_items
CREATE INDEX IF NOT EXISTS idx_sale_inventory_items_sale_id ON sale_inventory_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_inventory_items_inventory_id ON sale_inventory_items(inventory_id);
CREATE INDEX IF NOT EXISTS idx_sale_inventory_items_tenant_id ON sale_inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sale_inventory_items_sale_tenant ON sale_inventory_items(sale_id, tenant_id);

COMMIT;
