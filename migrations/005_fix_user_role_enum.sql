-- Migración: Cambiar columna role de ARRAY a ENUM
-- Razón: El rol debe ser un único valor, no un array

-- 1. Crear un tipo ENUM si no existe
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Cambiar la columna de ARRAY a ENUM
ALTER TABLE users
ALTER COLUMN role TYPE user_role USING role::user_role;

-- 3. Agregar valor por defecto
ALTER TABLE users
ALTER COLUMN role SET DEFAULT 'VENDOR';
