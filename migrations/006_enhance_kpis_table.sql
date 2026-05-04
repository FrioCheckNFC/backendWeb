-- Migration: Enhance KPIs table with additional fields
-- Date: 2026-04-27

ALTER TABLE kpis ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS calculation_type VARCHAR(50) DEFAULT 'MANUAL';
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS formula TEXT;
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS frequency VARCHAR(50) DEFAULT 'MONTHLY';
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS data_config JSONB;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kpis_category ON kpis(category);
CREATE INDEX IF NOT EXISTS idx_kpis_is_global ON kpis(is_global);
CREATE INDEX IF NOT EXISTS idx_kpis_calculation_type ON kpis(calculation_type);