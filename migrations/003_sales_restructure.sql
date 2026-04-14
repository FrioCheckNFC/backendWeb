-- Migración: Mejorar tabla sales y crear sale_items
-- Fecha: 2026-04-08
-- Descripción: Actualiza sales con nuevo flujo de pedidos y crea tabla de items/líneas de pedido
-- Los minoristas están registrados en users con role RETAILER

BEGIN;

-- ============================================
-- ACTUALIZAR TABLA SALES
-- ============================================
-- Agregar nuevas columnas a sales si no existen
ALTER TABLE sales ADD COLUMN IF NOT EXISTS retailer_id UUID NOT NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP;

-- Crear nuevos índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_tenant_retailer ON sales(tenant_id, retailer_id);
CREATE INDEX IF NOT EXISTS idx_sales_tenant_sale_date ON sales(tenant_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_tenant_delivery_status ON sales(tenant_id, delivery_status);

-- ============================================
-- CREAR TABLA SALE_ITEMS (LÍNEAS DE PEDIDO)
-- ============================================
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  sale_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT,
  product_sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

-- Crear índices para sale_items
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_tenant_id ON sale_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_tenant ON sale_items(sale_id, tenant_id);

COMMIT;
