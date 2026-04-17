-- Migración: Cambiar columna role de ARRAY a ENUM
-- Razón: El rol debe ser un único valor, no un array

-- 1. Crear un tipo ENUM si no existe
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Convertir role a ENUM user_role segun el tipo actual de la columna
DO $$
DECLARE
    role_data_type text;
BEGIN
    SELECT data_type
    INTO role_data_type
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'role';

    IF role_data_type = 'ARRAY' THEN
        EXECUTE '
            ALTER TABLE users
            ALTER COLUMN role DROP DEFAULT,
            ALTER COLUMN role TYPE user_role
            USING (
                CASE
                    WHEN role IS NULL OR array_length(role, 1) IS NULL THEN NULL
                    ELSE UPPER(TRIM(role[1]))::user_role
                END
            )
        ';
    ELSIF role_data_type = 'character varying' OR role_data_type = 'text' THEN
        EXECUTE '
            ALTER TABLE users
            ALTER COLUMN role DROP DEFAULT,
            ALTER COLUMN role TYPE user_role
            USING (
                CASE
                    WHEN role IS NULL THEN NULL
                    ELSE UPPER(TRIM(role))::user_role
                END
            )
        ';
    END IF;
END $$;

-- 3. Agregar valor por defecto
ALTER TABLE users
ALTER COLUMN role SET DEFAULT 'VENDOR';
