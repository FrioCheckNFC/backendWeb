# 📋 TABLA SECTORS (LOCALES FÍSICOS) - ESTRUCTURA FINAL COMPLETA

## Fecha: 7 de Abril de 2026

---

## 📊 ESTRUCTURA FINAL DE LA TABLA SECTORS

```sql
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           TABLA: sectors                                           │
├─────────────────────────┬──────────┬──────────┬──────────┬────────────────────────┤
│ Columna                 │ Tipo     │ Nullable │ Default  │ Descripción            │
├─────────────────────────┼──────────┼──────────┼──────────┼────────────────────────┤
│ id (PK)                 │ UUID     │ NO       │ -        │ ID único del local    │
│ tenant_id (FK)          │ UUID     │ NO       │ -        │ FK a tenants          │
│ name                    │ VARCHAR  │ NO       │ -        │ Nombre del local      │
│ description             │ TEXT     │ SÍ       │ NULL     │ Descripción           │
│ address                 │ TEXT     │ SÍ       │ NULL     │ Dirección física      │
│ latitude                │ DECIMAL  │ SÍ       │ NULL     │ Coordenada GPS        │
│ longitude               │ DECIMAL  │ SÍ       │ NULL     │ Coordenada GPS        │
│ contact_name            │ VARCHAR  │ SÍ       │ NULL     │ Nombre encargado      │
│ phone                   │ VARCHAR  │ SÍ       │ NULL     │ Teléfono encargado    │
│ email                   │ VARCHAR  │ SÍ       │ NULL     │ Email encargado       │
│ color                   │ VARCHAR  │ SÍ       │ NULL     │ Color UI (hex)        │
│ icon                    │ VARCHAR  │ SÍ       │ NULL     │ Ícono UI              │
│ order                   │ INT      │ NO       │ 0        │ Orden visualización    │
│ is_active               │ BOOLEAN  │ NO       │ true     │ Estado del local      │
│ created_at              │ DATETIME │ NO       │ NOW()    │ Auto timestamp        │
│ updated_at              │ DATETIME │ NO       │ NOW()    │ Auto timestamp        │
│ deleted_at              │ DATETIME │ SÍ       │ NULL     │ Soft delete           │
└─────────────────────────┴──────────┴──────────┴──────────┴────────────────────────┘

TOTAL: 18 columnas
ÍNDICES: 
  - PRIMARY KEY: id
  - UNIQUE: (tenant_id, name)
  - INDEX: tenant_id
  - INDEX: (tenant_id, order)
  - INDEX: (tenant_id, address)
  - INDEX: (tenant_id, contact_name)
```

---

## 📝 EJEMPLO DE DATOS EN LA TABLA

```
┌──────────┬──────────┬────────────────┬─────────────────────────┬──────────────────────┐
│ id       │ name     │ contact_name   │ address                 │ phone                 │
├──────────┼──────────┼────────────────┼─────────────────────────┼──────────────────────┤
│ 001-uuid │ Bodegón  │ Roberto Díaz   │ Av. Libertador 45, Este │ +56912345678         │
│ 002-uuid │ Sucursal │ Juan Pérez     │ Calle Principal 123     │ +56998765432         │
│ 003-uuid │ Centro   │ María García   │ Plaza Mayor 456         │ +56911111111         │
└──────────┴──────────┴────────────────┴─────────────────────────┴──────────────────────┘

┌──────────────┬───────────────┬────────┬──────────┬─────────────────────────────────┐
│ latitude     │ longitude     │ color  │ icon     │ machines_asignadas (RELACIÓN)  │
├──────────────┼───────────────┼────────┼──────────┼─────────────────────────────────┤
│ -33.8688     │ -56.1636      │ #FF5733│ fas-store│ 12 máquinas (con NFC tags)     │
│ -34.6037     │ -58.3816      │ #3498DB│ fas-shop │ 8 máquinas (con NFC tags)      │
│ -33.4489     │ -70.6693      │ #2ECC71│ fas-cube │ 15 máquinas (con NFC tags)     │
└──────────────┴───────────────┴────────┴──────────┴─────────────────────────────────┘
```

---

## 🔗 RELACIONES Y ESTRUCTURA

```
SECTORS (Locales Físicos)
    │
    ├─ id, name, address, contactName, phone, email
    ├─ latitude, longitude (datos físicos)
    ├─ color, icon (UI)
    │
    └─ MACHINES (FK: sector_id)
         │
         ├─ id, serialNumber, model, brand, status
         │
         └─ NFC_TAGS (FK: machine_id)
              │
              ├─ id, uid, tagModel, isActive
```

---

## 📦 ARCHIVOS CREADOS/MODIFICADOS

### ✅ Entidades
```
✓ src/modules/sectors/entities/sector.entity.ts
  └─ 18 columnas completas
  └─ Relación OneToMany con Machine
  └─ ApiProperty decorators para documentación

✓ src/modules/machines/entities/machine.entity.ts
  └─ Agregado: sectorId (FK a Sector)
  └─ Agregado: Relación ManyToOne con Sector
  └─ Agregado: Índice para sectorId
```

### ✅ DTOs
```
✓ src/modules/sectors/dto/create-sector.dto.ts
  └─ Todos los campos con validaciones

✓ src/modules/sectors/dto/update-sector.dto.ts
  └─ Todos los campos opcionales

✓ src/modules/sectors/dto/sector-response.dto.ts
  └─ SectorResponseDto con machineCount y nfcTagCount
  └─ SectorMachineDto para máquinas en el local
```

### ✅ Servicio
```
✓ src/modules/sectors/sectors.service.ts
  └─ create() - Crear local
  └─ findAll() - Listar con conteos
  └─ findOne() - Un local
  └─ findOneWithMachines() - Local + máquinas + NFC tags
  └─ countMachinesBySector() - Contar máquinas
  └─ countNfcTagsBySector() - Contar NFC tags
  └─ update() - Actualizar
  └─ delete() - Soft delete
```

### ✅ Controlador
```
✓ src/modules/sectors/sectors.controller.ts
  └─ POST   /sectors - Crear
  └─ GET    /sectors - Listar todos
  └─ GET    /sectors/:id - Obtener uno
  └─ GET    /sectors/:id/details - Local con máquinas y NFC
  └─ PATCH  /sectors/:id - Actualizar
  └─ DELETE /sectors/:id - Eliminar
```

### ✅ Módulo
```
✓ src/modules/sectors/sectors.module.ts
  └─ Importa: Sector, Machine, NfcTag
  └─ Incluye: SectorsService, SectorsController
```

### ✅ Scripts SQL
```
✓ migrations/001_expand_sectors_table.sql
  └─ Agrega 13 columnas nuevas
  └─ Crea 3 índices para búsquedas rápidas
```

---

## 🎯 ENDPOINTS DISPONIBLES

### 1. Crear Local
```bash
POST /sectors
Content-Type: application/json

{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Bodegón El Sol",
  "description": "Sucursal principal con 12 máquinas",
  "address": "Av. Libertador 45, Este",
  "latitude": -33.8688,
  "longitude": -56.1636,
  "contactName": "Roberto Díaz",
  "phone": "+56912345678",
  "email": "roberto@example.com",
  "color": "#FF5733",
  "icon": "fas-store",
  "order": 1
}
```

### 2. Listar Todos los Locales
```bash
GET /sectors?tenantId=550e8400...&isActive=true&skip=0&take=20
```

**Respuesta:**
```json
{
  "sectors": [
    {
      "id": "123e4567...",
      "name": "Bodegón El Sol",
      "address": "Av. Libertador 45, Este",
      "contactName": "Roberto Díaz",
      "phone": "+56912345678",
      "email": "roberto@example.com",
      "machineCount": 12,
      "nfcTagCount": 12,
      "isActive": true,
      "createdAt": "2026-04-01T10:30:00Z",
      "updatedAt": "2026-04-07T15:45:00Z"
    }
  ],
  "total": 3
}
```

### 3. Obtener Local con Máquinas y NFC Tags
```bash
GET /sectors/{id}/details?tenantId=550e8400...
```

**Respuesta:**
```json
{
  "id": "123e4567...",
  "name": "Bodegón El Sol",
  "address": "Av. Libertador 45, Este",
  "contactName": "Roberto Díaz",
  "phone": "+56912345678",
  "machineCount": 12,
  "nfcTagCount": 12,
  "machines": [
    {
      "id": "machine-uuid-1",
      "serialNumber": "SN-2024-001",
      "model": "Vending Machine Pro V2",
      "brand": "VendTech",
      "status": "ACTIVE",
      "nfcTagCount": 12
    },
    {
      "id": "machine-uuid-2",
      "serialNumber": "SN-2024-002",
      "model": "Vending Machine Pro V2",
      "brand": "VendTech",
      "status": "ACTIVE",
      "nfcTagCount": 8
    }
  ]
}
```

### 4. Actualizar Local
```bash
PATCH /sectors/{id}?tenantId=550e8400...
Content-Type: application/json

{
  "contactName": "Juan Pérez",
  "phone": "+56998765432",
  "order": 2
}
```

### 5. Eliminar Local
```bash
DELETE /sectors/{id}?tenantId=550e8400...
```

---

## ✅ VALIDACIONES IMPLEMENTADAS

- ✓ Nombre único por tenant
- ✓ Coordenadas GPS válidas (-90 a 90, -180 a 180)
- ✓ Color hexadecimal válido (#RRGGBB)
- ✓ Email válido
- ✓ Soft delete (no elimina físicamente)
- ✓ Multi-tenant seguro
- ✓ Conteo automático de máquinas y NFC tags

---

## 🔧 PRÓXIMOS PASOS

1. **Ejecutar SQL:**
   ```bash
   psql -h friocheck-db-server.postgres.database.azure.com \
        -U friocheck_admin \
        -d friocheck_db \
        -f migrations/001_expand_sectors_table.sql
   ```

2. **Compilar:**
   ```bash
   npm run build
   ```

3. **Iniciar:**
   ```bash
   npm start:dev
   ```

4. **Probar en Swagger:**
   ```
   http://localhost:3001/api/docs
   ```

---

## 📌 NOTAS IMPORTANTES

- Todos los datos nuevos son **opcionales** (nullable) para mantener compatibilidad
- La tabla sectors ahora contiene **TODA LA INFORMACIÓN DEL LOCAL FÍSICO**
- Eliminada la tabla "locations" (sus datos están en sectors)
- Las máquinas (`machines`) apuntan a `sectors` mediante `sector_id`
- Los NFC tags siguen siendo propiedad de las máquinas
- Conteo de máquinas y NFC tags es **automático y en tiempo real**
