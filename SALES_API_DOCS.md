# Módulo de Sales (Ventas/Pedidos)

## Descripción
Conjunto de endpoints para gestionar ventas/pedidos en la plataforma. Todos los endpoints requieren autenticación JWT y usarán automáticamente el `tenantId` del usuario autenticado.

## Base de Datos
Tabla: `sales`

Campos:
- `id` (UUID): ID único de la venta
- `tenant_id` (UUID): ID del tenant propietario
- `vendor_id` (UUID, nullable): ID del vendedor/usuario que realizó la venta
- `sector_id` (UUID, nullable): ID del local/sector donde se realizó la venta
- `machine_id` (UUID, nullable): ID de la máquina asociada
- `amount` (DECIMAL): Monto de la venta
- `description` (TEXT, nullable): Descripción de la venta
- `sale_date` (TIMESTAMP): Fecha y hora de la venta
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización
- `deleted_at` (TIMESTAMP, nullable): Fecha de eliminación (soft delete)

## Endpoints

### 1. Crear una nueva venta
**POST** `/sales`

**Headers requeridos:**
```
Authorization: Bearer {token_jwt}
```

**Body:**
```json
{
  "vendorId": "660e8400-e29b-41d4-a716-446655440001",          // Opcional
  "sectorId": "770e8400-e29b-41d4-a716-446655440002",          // Opcional
  "machineId": "880e8400-e29b-41d4-a716-446655440003",         // Opcional
  "amount": 25000.50,                                            // Requerido
  "description": "Venta de 2 unidades de producto X",           // Opcional
  "saleDate": "2026-04-08T15:30:00Z"                            // Requerido (ISO 8601)
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "vendorId": "660e8400-e29b-41d4-a716-446655440001",
  "sectorId": "770e8400-e29b-41d4-a716-446655440002",
  "machineId": "880e8400-e29b-41d4-a716-446655440003",
  "amount": 25000.50,
  "description": "Venta de 2 unidades de producto X",
  "saleDate": "2026-04-08T15:30:00.000Z",
  "createdAt": "2026-04-08T15:30:00.000Z",
  "updatedAt": "2026-04-08T15:30:00.000Z",
  "deletedAt": null
}
```

---

### 2. Obtener todas las ventas
**GET** `/sales`

**Headers requeridos:**
```
Authorization: Bearer {token_jwt}
```

**Query Parameters:**
- `skip` (number, opcional): Registros a saltar (default: 0)
- `take` (number, opcional): Cantidad de registros (default: 50)
- `startDate` (string, opcional): Fecha de inicio (ISO 8601)
- `endDate` (string, opcional): Fecha de fin (ISO 8601)
- `sectorId` (string, opcional): Filtrar por sector
- `machineId` (string, opcional): Filtrar por máquina
- `vendorId` (string, opcional): Filtrar por vendedor

**Response (200):**
```json
{
  "sales": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "vendorId": "660e8400-e29b-41d4-a716-446655440001",
      "sectorId": "770e8400-e29b-41d4-a716-446655440002",
      "machineId": "880e8400-e29b-41d4-a716-446655440003",
      "amount": 25000.50,
      "description": "Venta de 2 unidades de producto X",
      "saleDate": "2026-04-08T15:30:00.000Z",
      "createdAt": "2026-04-08T15:30:00.000Z",
      "updatedAt": "2026-04-08T15:30:00.000Z",
      "deletedAt": null
    }
  ],
  "total": 100
}
```

---

### 3. Obtener una venta específica
**GET** `/sales/:id`

**Headers requeridos:**
```
Authorization: Bearer {token_jwt}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "vendorId": "660e8400-e29b-41d4-a716-446655440001",
  "sectorId": "770e8400-e29b-41d4-a716-446655440002",
  "machineId": "880e8400-e29b-41d4-a716-446655440003",
  "amount": 25000.50,
  "description": "Venta de 2 unidades de producto X",
  "saleDate": "2026-04-08T15:30:00.000Z",
  "createdAt": "2026-04-08T15:30:00.000Z",
  "updatedAt": "2026-04-08T15:30:00.000Z",
  "deletedAt": null
}
```

**Response (404):**
```json
{
  "statusCode": 404,
  "message": "Venta con ID {id} no encontrada"
}
```

---

### 4. Actualizar una venta
**PATCH** `/sales/:id`

**Headers requeridos:**
```
Authorization: Bearer {token_jwt}
```

**Body:** (Todos los campos son opcionales)
```json
{
  "vendorId": "660e8400-e29b-41d4-a716-446655440001",
  "sectorId": "770e8400-e29b-41d4-a716-446655440002",
  "machineId": "880e8400-e29b-41d4-a716-446655440003",
  "amount": 30000.75,
  "description": "Descripción actualizada",
  "saleDate": "2026-04-08T16:45:00Z"
}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "vendorId": "660e8400-e29b-41d4-a716-446655440001",
  "sectorId": "770e8400-e29b-41d4-a716-446655440002",
  "machineId": "880e8400-e29b-41d4-a716-446655440003",
  "amount": 30000.75,
  "description": "Descripción actualizada",
  "saleDate": "2026-04-08T16:45:00.000Z",
  "createdAt": "2026-04-08T15:30:00.000Z",
  "updatedAt": "2026-04-08T16:45:00.000Z",
  "deletedAt": null
}
```

---

### 5. Eliminar una venta (Soft Delete)
**DELETE** `/sales/:id`

**Headers requeridos:**
```
Authorization: Bearer {token_jwt}
```

**Response (200):**
```json
{
  "message": "Venta {id} eliminada exitosamente"
}
```

**Response (404):**
```json
{
  "statusCode": 404,
  "message": "Venta con ID {id} no encontrada"
}
```

---

### 6. Obtener estadísticas de ventas
**GET** `/sales/stats/summary`

**Headers requeridos:**
```
Authorization: Bearer {token_jwt}
```

**Query Parameters:**
- `startDate` (string, opcional): Fecha de inicio (ISO 8601)
- `endDate` (string, opcional): Fecha de fin (ISO 8601)
- `sectorId` (string, opcional): Filtrar por sector

**Response (200):**
```json
{
  "totalSales": 100,
  "totalAmount": 2500000.50,
  "averageAmount": 25000.50,
  "saleCount": 100
}
```

---

## Ejemplos de uso

### Crear una venta
```bash
curl -X POST http://localhost:3001/sales \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "sectorId": "770e8400-e29b-41d4-a716-446655440002",
    "amount": 25000.50,
    "description": "Venta de bebidas comerciales",
    "saleDate": "2026-04-08T15:30:00Z"
  }'
```

### Listar ventas con filtros
```bash
curl -X GET "http://localhost:3001/sales?sectorId=770e8400-e29b-41d4-a716-446655440002&skip=0&take=20" \
  -H "Authorization: Bearer {token}"
```

### Obtener estadísticas
```bash
curl -X GET "http://localhost:3001/sales/stats/summary?startDate=2026-04-01T00:00:00Z&endDate=2026-04-08T23:59:59Z" \
  -H "Authorization: Bearer {token}"
```

### Actualizar una venta
```bash
curl -X PATCH http://localhost:3001/sales/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 30000.75,
    "description": "Descripción actualizada"
  }'
```

### Eliminar una venta
```bash
curl -X DELETE http://localhost:3001/sales/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer {token}"
```

---

## Notas importantes

1. **Tenant automático**: El `tenantId` se asigna automáticamente desde el token JWT del usuario autenticado
2. **Campos opcionales**: `vendorId`, `sectorId`, `machineId` y `description` son opcionales
3. **Soft Delete**: Al eliminar, los registros se marcan como eliminados (no se eliminan físicamente)
4. **Paginación**: Por defecto retorna 50 registros, máximo recomendado 100
5. **Filtros de fecha**: Usar formato ISO 8601 (2026-04-08T15:30:00Z)
6. **Montos**: Decimal con precisión de 2 decimales

