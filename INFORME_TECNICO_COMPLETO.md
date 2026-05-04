# INFORME TÉCNICO COMPLETO - BACKEND FRIOCHECK

## 1. DEFINICIÓN TÉCNICA Y CORE

### 1.1 Stack Tecnológico - Versiones Exactas

| Tecnología | Versión | Notas |
|------------|---------|-------|
| Node.js | 20.x | Alpine (Docker) |
| NestJS | 10.0.0 | Framework principal |
| TypeORM | 0.3.17 | ORM para PostgreSQL |
| PostgreSQL | 15-alpine | Base de datos principal |
| Redis | 7-alpine | Caché y sesiones |
| TypeScript | ES2023 | Target de compilación |
| @nestjs/jwt | 10.0.0 | Manejo de tokens JWT |
| @nestjs/passport | 10.0.0 | Autenticación Passport |
| bcrypt | 5.1.1 | Hash de contraseñas |
| Socket.io | 4.7.0 | WebSockets |
| class-validator | 0.14.0 | Validación DTOs |
| @nestjs/swagger | 7.4.2 | Documentación API |

### 1.2 Infraestructura y Despliegue

**Docker Compose:**
- PostgreSQL 15-alpine en puerto 5432
- Redis 7-alpine en puerto 6379
- pgAdmin 4 en puerto 5050 (panel visual)

**Dockerfile:**
- Multi-stage build (builder + production)
- Node.js 20-alpine
- Puerto expuesto: 3000
- NODE_ENV=production

**Despliegue:**
- Configurado para Azure (soporte SSL con rejectUnauthorized: false)
- Variables de entorno configurables via .env
- Puerto por defecto: 3000

### 1.3 Arquitectura de Carpetas

```
src/
├── main.ts                    # Punto de entrada bootstrap
├── app.module.ts              # Módulo raíz con configuración global
├── app.controller.ts          # Controller raíz
├── app.service.ts             # Servicio raíz
│
└── modules/
    ├── auth/                  # Autenticación y JWT
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── auth.module.ts
    │   ├── jwt.strategy.ts
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts
    │   │   └── roles.guard.ts
    │   ├── decorators/
    │   │   └── roles.decorator.ts
    │   ├── dto/
    │   └── entities/
    │       └── password-reset-token.entity.ts
    │
    ├── users/                 # Gestión de usuarios
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   ├── users.module.ts
    │   ├── dto/
    │   └── entities/
    │       └── user.entity.ts
    │
    ├── tenants/               # Multi-tenant
    │   ├── tenants.controller.ts
    │   ├── tenants.service.ts
    │   ├── tenants.module.ts
    │   ├── dto/
    │   └── entities/
    │       └── tenant.entity.ts
    │
    ├── machines/              # Máquinas vending
    │   ├── machines.controller.ts
    │   ├── machines.service.ts
    │   ├── machines.module.ts
    │   ├── dto/
    │   └── entities/
    │       ├── machine.entity.ts
    │       └── machine-history.entity.ts
    │
    ├── visits/                # Visitas técnicas
    │   ├── visits.controller.ts
    │   ├── visits.service.ts
    │   ├── visits.module.ts
    │   ├── dto/
    │   └── entities/
    │       └── visit.entity.ts
    │
    ├── tickets/              # Tickets de incidentes
    │   ├── tickets.controller.ts
    │   ├── tickets.service.ts
    │   ├── tickets.module.ts
    │   ├── dto/
    │   └── entities/
    │       └── ticket.entity.ts
    │
    ├── nfc-tags/             # Tags NFC
    │   ├── nfc-tags.controller.ts
    │   ├── nfc-tags.service.ts
    │   ├── nfc-tags.module.ts
    │   ├── dto/
    │   └── entities/
    │       └── nfc-tag.entity.ts
    │
    ├── notifications/        # Sistema de notificaciones
    │   ├── notifications.controller.ts
    │   ├── notifications.service.ts
    │   ├── notifications.module.ts
    │   ├── dto/
    │   └── entities/
    │       └── notification.entity.ts
    │
    ├── media/                # Gestión de archivos/media
    │   ├── media.controller.ts
    │   ├── media.service.ts
    │   ├── media.module.ts
    │   ├── dto/
    │   ├── entities/
    │   │   └── media-evidence.entity.ts
    │   └── services/
    │       └── azure-blob-storage.service.ts
    │
    ├── application/          # Capa de aplicación (Clean Architecture)
    ├── attachments/          # Gestión de archivos adjuntos
    ├── dashboard/            # Dashboard y métricas
    ├── domain/               # Capa de dominio (Clean Architecture)
    ├── infrastructure/       # Capa de infraestructura (Clean Architecture)
    ├── locations/            # Ubicaciones/Tiendas (En transición hacia sectors)
    ├── sectors/              # Sectores/Locales Físicos (Nueva estructura unificada)
    ├── work-orders/          # Órdenes de trabajo
    ├── mermas/               # Gestión de mermas
    ├── kpis/                 # KPIs y métricas
    ├── inventory/            # Inventario
    ├── sales/                # Ventas y pedidos
    ├── sync-queue/           # Cola de sincronización
    └── web/                  # Módulo web
```

### 1.4 Patrones de Diseño Implementados

**1. Inyección de Dependencias (DI):**
- NestJS usa inyección nativa via constructores
- Todos los servicios se inyectan en los módulos
- Ejemplo: `constructor(private authService: AuthService) {}`

**2. Repository Pattern:**
- TypeORM maneja repositorios para cada entidad
- `@InjectRepository(Entity)` para acceder a la BD
- Métodos: find(), findOne(), save(), delete(), etc.

**3. Patrón Controller-Service-Repository:**
- Controllers: reciben HTTP requests, validan DTOs
- Services: contienen lógica de negocio
- Repositories: interactúan con la BD

**4. Patrón DTO (Data Transfer Objects):**
- class-validator para validación automática
- ValidationPipe con whitelist:true
- Ejemplo: `LoginDto`, `RegisterDto`, `CreateMachineDto`

**5. Guards (Protectores):**
- JwtAuthGuard: valida JWT en cada request
- RolesGuard: verifica permisos RBAC
- Se usan juntos: `@UseGuards(JwtAuthGuard, RolesGuard)`

**6. Decoradores Personalizados:**
- @Roles('ADMIN', 'TECHNICIAN'): define roles permitidos
- @GetUser(): extrae usuario del token JWT

---

## 2. SEGURIDAD Y ACCESO (EL "CEREBRO")

### 2.1 Autenticación JWT - Flujo Completo

**Mejoras Recientes (Autenticación y DTOs):**
- **Strict Property Initialization:** Se corrigieron múltiples DTOs (Login, Register, etc.) añadiendo el operador `!` para cumplir con el modo estricto de TypeScript.
- **Manejo de Excepciones:** En `AuthService.register()`, se cambió el uso de `UnauthorizedException` a `BadRequestException` para manejar correctamente errores de email duplicado.

**Proceso de Login:**
```
1. Frontend envía: { email, password }
2. AuthService.login():
   - Busca usuario por email
   - Verifica si usuario está activo (active: true)
   - bcrypt.compare(password, passwordHash)
   - Si es válido: jwtService.sign(payload)
3. Retorna: { access_token, user }
```

**Payload del JWT:**
```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@email.com",
  "role": ["VENDOR", "TECHNICIAN"],
  "tenantId": "uuid-del-tenant",
  "iat": 1714320000,
  "exp": 1714406400
}
```

**Estrategia JWT (jwt.strategy.ts):**
- Extracción: `ExtractJwt.fromAuthHeaderAsBearerToken()`
- Validación: secretOrKey desde ConfigService
- ignoreExpiration: false (rechaza tokens expirados)
- validate(): inyecta datos en req.user

**Configuración en auth.module.ts:**
```typescript
JwtModule.register({
  global: true,
  secret: configService.get('JWT_SECRET') || 'changeme',
  signOptions: { expiresIn: '1d' },
})
```

**Estado Actual de Tokens:**
- Tiempo de expiración: 1 día (configurable)
- NO hay implementación de refresh tokens aún
- NO hay logout/blacklist de tokens

### 2.2 Autorización (RBAC) - Roles Implementados

**Enumeración de Roles (user.entity.ts):**
```typescript
export enum UserRole {
  VENDOR = 'VENDOR',
  TECHNICIAN = 'TECHNICIAN',
  DRIVER = 'DRIVER',
  RETAILER = 'RETAILER',
  SUPPORT = 'SUPPORT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
```

**Almacenamiento en BD:**
- Tipo: `text array` (PostgreSQL)
- Permite múltiples roles por usuario
- Ejemplo: `['ADMIN', 'TECHNICIAN']`

**RolesGuard (lógica de verificación):**
```typescript
// 1. Lee roles requeridos del decorador @Roles()
const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [...])

// 2. Obtiene roles del usuario desde req.user
const userRoles = user.role || user.roles

// 3. SUPER_ADMIN tiene acceso a todo
if (userRoles.includes('SUPER_ADMIN')) return true

// 4. Verifica intersección
return userRoles.some(role => requiredRoles.includes(role))
```

**Ejemplos de Uso en Controllers:**
```typescript
// Máquinas - solo ADMIN y SUPPORT pueden crear
@Post()
@Roles('ADMIN', 'SUPPORT')
async create(...)

// Lectura - todos los roles autenticados
@Get()
@Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
async findAll(...)
```

### 2.3 Multi-tenant - Aislamiento de Datos

**Implementación a Nivel de Base de Datos:**

Cada tabla principal tiene el campo `tenant_id`:
```sql
-- Tabla users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email VARCHAR UNIQUE,
  ...
);

-- Tabla machines
CREATE TABLE machines (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  serial_number VARCHAR,
  ...
);

-- Tabla visits
CREATE TABLE visits (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  ...
);
```

**Índices para Optimización:**
```sql
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_machines_tenant ON machines(tenant_id);
CREATE INDEX idx_visits_tenant ON visits(tenant_id);
-- etc.
```

**Filtrado Automático en Servicios:**

Todos los servicios reciben `tenantId` como parámetro:
```typescript
async findAll(tenantId: string, ...) {
  const where: FindOptionsWhere<Entity> = { tenantId, deletedAt: IsNull() };
  return this.repo.find({ where });
}
```

**Entidades con tenant_id:**
- users
- tenants
- machines
- visits
- tickets
- nfc_tags
- notifications
- media_evidence
- locations
- sectors
- work_orders
- mermas
- kpis
- inventory
- sales

**Protección a Nivel de Código:**
- El JwtStrategy inyecta tenantId en req.user
- Todos los endpoints requieren autenticación
- Los servicios filtran por tenantId automáticamente

---

## 3. LÓGICA DE NEGOCIO Y FLUJOS CRÍTICOS

### 3.1 Validación de Visitas - NFC y GPS

**Entidad Visit (visit.entity.ts):**
```typescript
@Entity('visits')
export class Visit {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  // Coordenadas GPS
  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8 })
  latitude: number | null;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8 })
  longitude: number | null;

  // Tag NFC asociado
  @Column({ name: 'nfc_tag_id', type: 'uuid', nullable: true })
  nfcTagId: string | null;

  @Column({ name: 'temperature', type: 'decimal', precision: 5, scale: 2 })
  temperature: number | null;

  @Column({ name: 'status' })
  status: VisitStatus; // ABIERTA, CERRADA, ANULADA

  @Column({ name: 'visited_at', type: 'timestamp' })
  visitedAt: Date | null;
}
```

**Flujo de Creación de Visita (visits.service.ts):**
```typescript
async create(tenantId, technicianId, data) {
  // 1. Validar que el tenant existe
  await this.validateTenantExists(tenantId);

  // 2. Validar que el técnico existe y pertenece al tenant
  await this.validateTechnicianExists(tenantId, finalTechnicianId);

  // 3. Validar que la máquina existe y pertenece al tenant
  await this.validateMachineExists(tenantId, data.machineId);

  // 4. Si se envía NFC tag, validar que existe y está asociado a la máquina
  if (data.nfcTagId) {
    await this.validateNfcTagExists(tenantId, data.nfcTagId, data.machineId);
  }

  // 5. Crear la visita con coordenadas y datos del NFC
  const visit = this.visitsRepo.create({
    tenantId,
    technicianId,
    machineId,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    nfcTagId: data.nfcTagId ?? null,
    temperature: data.temperature ?? null,
    visitedAt: new Date(),
    status: VisitStatus.ABIERTA,
  });

  return this.visitsRepo.save(visit);
}
```

**Validación de NFC Tag:**
```typescript
async validateNfcTagExists(tenantId: string, nfcTagId: string, machineId: string) {
  const nfcTag = await this.nfcTagsRepo.findOne({
    where: { id: nfcTagId, tenantId, deletedAt: IsNull() }
  });

  if (!nfcTag) {
    throw new NotFoundException(`Tag NFC con ID ${nfcTagId} no encontrado`);
  }

  if (nfcTag.machineId !== machineId) {
    throw new BadRequestException('El tag NFC no está asociado a esta máquina');
  }
}
```

**Estado Actual - Fórmula Haversine:**
- NO hay implementación de cálculo de distancia GPS
- El frontend envía las coordenadas directamente
- El backend las almacena sin validación de proximidad
- **PENDIENTE**: Implementar validación Haversine para verificar que el técnico está físicamente en la ubicación de la máquina

### 3.2 Manejo de Archivos - Evidencias y Media

**Servicio de Media (media.service.ts):**

Flujo de Subida de Archivos:
```
1. Frontend solicita URL presignada
   POST /api/v1/media/request-presigned-url
   Body: { tenantId, entityType, entityId, fileName, mimeType, fileSizeBytes }

2. Backend valida tamaño máximo (100 MB)
   Genera nombre único de blob
   Crea URL presignada (30 minutos de expiración)
   Guarda registro en BD con estado "pending"

3. Frontend sube archivo directamente a Azure Blob Storage

4. Frontend confirma upload
   POST /api/v1/media/confirm-upload
   Body: { mediaId, tenantId }

5. Backend verifica y actualiza estado a "confirmed"
```

**Entidad MediaEvidence:**
```typescript
@Entity('media_evidence')
export class MediaEvidence {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'entity_type' })  // TICKET, VISIT, MACHINE, etc.
  entityType: EntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'blob_name' })
  blobName: string;

  @Column({ name: 'blob_url' })
  blobUrl: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size_bytes' })
  fileSizeBytes: number;

  @Column({ name: 'status' })  // pending, confirmed, failed
  status: string;
}
```

**Azure Blob Storage Service:**
- Integración con Azure Blob Storage
- URLs presignadas con expiración configurable
- Soporte para cualquier tipo de archivo (imágenes, PDFs, etc.)
- Almacenamiento por tenant para aislamiento

### 3.3 Módulo de Notificaciones

**Entidad Notification (notification.entity.ts):**
```typescript
export enum NotificationChannel {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
}

export enum NotificationEvent {
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  TICKET_UPDATED = 'TICKET_UPDATED',
  WORK_ORDER_CREATED = 'WORK_ORDER_CREATED',
  VISIT_ASSIGNED = 'VISIT_ASSIGNED',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity('notifications')
export class Notification {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'channel' })
  channel: NotificationChannel;

  @Column({ name: 'event' })
  event: NotificationEvent;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'message' })
  message: string;

  @Column({ name: 'status' })
  status: NotificationStatus;
}
```

**Flujo de Notificaciones (notifications.service.ts):**
```typescript
async sendNotification(options) {
  // 1. Crear registro de notificación para cada canal
  for (const channel of channels) {
    const notification = this.notificationRepo.create({
      tenantId, userId, channel, event, title, message, ...
    });
    await this.notificationRepo.save(notification);

    // 2. Enviar según el canal
    switch (channel) {
      case NotificationChannel.PUSH:
        await this.sendPushNotification(notification);
        break;
      case NotificationChannel.EMAIL:
        await this.sendEmailNotification(notification);
        break;
      case NotificationChannel.SMS:
        await this.sendSmsNotification(notification);
        break;
      case NotificationChannel.IN_APP:
        await this.sendInAppNotification(notification);
        break;
    }
  }
}
```

**Estado Actual - Firebase Cloud Messaging:**
- **PENDIENTE**: Integración real con FCM
- Los métodos actuales son simulaciones
- Se guardan en BD pero no se envían realmente
- Tokens FCM almacenados en usuario (campo fcmTokens)

---

### 3.4 Validaciones Avanzadas (Módulo Machines)

En las actualizaciones más recientes del sistema, se ha fortalecido la validación a nivel de servicios:
- **Validación Multi-tenant Estricta:** `assignedUserId` se valida exhaustivamente contra la tabla de usuarios para garantizar que pertenece al mismo `tenantId`.
- **Derivación Automática:** `assignedUserId` puede derivarse directamente del `retailer_id` de la tienda (Store/Sector) si no se provee.
- **Validación de Local (Store/Sector):** Se requiere que el `storeId` o `sectorId` exista y pertenezca al mismo tenant al crear una máquina, resolviendo automáticamente el nombre del local para las respuestas.

---

## 4. ESTADO ACTUAL Y BASE DE DATOS

### 4.1 Entidades Principales y Relaciones

**Diagrama de Entidades:**

```
┌─────────────┐       ┌─────────────┐
│   Tenant    │       │    User     │
├─────────────┤       ├─────────────┤
│ id (UUID)   │◄──────│ tenant_id   │
│ name        │       │ id (UUID)   │
│ slug        │       │ email       │
│ is_active   │       │ role []     │
└─────────────┘       │ fcmTokens   │
                      └─────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Machine    │     │    Visit    │     │   Ticket    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ tenant_id   │     │ tenant_id   │     │ tenant_id   │
│ id (UUID)   │     │ id (UUID)   │     │ id (UUID)   │
│ assignedUser│◄────│ technicianId│     │ createdById │
│ storeId     │     │ machineId   │◄────│ machineId   │
│ sectorId    │     │ nfcTagId    │     │ assignedToId│
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  NfcTag     │     │  Location   │     │  Media      │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ tenant_id   │     │ tenant_id   │     │ tenant_id   │
│ machineId   │◄────│ id (UUID)   │     │ entityType  │
│ uid         │     │ name        │     │ entityId    │
└─────────────┘     └─────────────┘     │ blobUrl     │
                                        └─────────────┘
```

**Lista de Tablas/Entidades:**

| Entidad | Descripción | Campos Clave |
|---------|-------------|--------------|
| tenants | Empresas/clientes | id, name, slug, is_active |
| users | Usuarios del sistema | id, tenant_id, email, role[], fcmTokens |
| machines | Máquinas vending | id, tenant_id, serial_number, storeId, sectorId |
| visits | Visitas técnicas | id, tenant_id, technicianId, machineId, latitude, longitude, nfcTagId |
| tickets | Tickets de incidentes | id, tenant_id, machineId, reportedById, assignedToId, priority, status |
| nfc_tags | Tags NFC | id, tenant_id, machineId, uid |
| locations | Tiendas/ubicaciones (En desuso) | id, tenant_id, name, address |
| sectors | Locales físicos completos | id, tenant_id, name, address, latitude, longitude, contact_name |
| attachments | Archivos adjuntos | id, tenant_id, filename, url |
| notifications | Registro de notificaciones | id, tenant_id, userId, channel, event, status |
| media_evidence | Archivos evidencias | id, tenant_id, entityType, entityId, blobUrl, status |
| work_orders | Órdenes de trabajo | id, tenant_id, ... |
| mermas | Registro de mermas | id, tenant_id, ... |
| kpis | Métricas KPIs | id, tenant_id, ... |
| inventory | Inventario | id, tenant_id, ... |
| sales | Ventas y Pedidos | id, tenant_id, vendor_id, sector_id, machine_id, amount, sale_date |

### 4.2 Manejo de Errores

**Configuración Global (main.ts):**
```typescript
// 1. ValidationPipe con whitelist
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,  // Elimina campos no definidos en DTO
}));

// 2. Prefijo global de API
app.setGlobalPrefix('api/v1');

// 3. CORS habilitado
app.enableCors({ ... });

// 4. Swagger para documentación
SwaggerModule.setup('api', app, document);
```

**Manejo de Excepciones en Servicios:**
```typescript
// Ejemplo típico
throw new UnauthorizedException('Credenciales inválidas');
throw new NotFoundException(`Entidad con ID ${id} no encontrada`);
throw new BadRequestException('Datos inválidos');
```

**Estado Actual:**
- NO hay filtro global de excepciones personalizado
- NO hay integración con Sentry o Winston
- Los errores se muestran según NestJS por defecto
- **PENDIENTE**: Implementar filtro global de excepciones
- **PENDIENTE**: Integrar logging con Winston
- **PENDIENTE**: Integrar Sentry para tracking de errores

### 4.3 Endpoints Clave - Estado Actual

**Módulo Auth (/api/v1/auth):**
| Método | Endpoint        | Descripción            | Estado    |
|--------|-----------------|------------------------|-----------|
| POST   | /login          | Iniciar sesión         |  Completo |
| POST   | /register       | Registrar usuario      |  Completo |
| POST   | /change-password| Cambiar contraseña     |  Completo |
| POST   | /forgot-password| Solicitar recuperación |  Completo |
| POST   | /reset-password | Resetear contraseña    |  Completo |
| POST   | /refresh        | Renovar token          |  Completo |

**Módulo Users (/api/v1/users):**
| Método | Endpoint | Descripción        | Estado    |
|--------|----------|--------------------|-----------|
| GET    | /        | Listar usuarios    |  Completo |
| GET    | /:id     | Obtener usuario    |  Completo |
| POST   | /        | Crear usuario      |  Completo |
| PATCH  | /:id     | Actualizar usuario |  Completo |
| DELETE | /:id     | Eliminar usuario   |  Completo |

**Módulo Machines (/api/v1/machines):**
| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | / | Listar máquinas | ✅ Completo |
| GET | /:id | Obtener máquina | ✅ Completo |
| POST | / | Crear máquina | ✅ Completo |
| PATCH | /:id | Actualizar máquina | ✅ Completo |
| DELETE | /:id | Eliminar máquina | ✅ Completo |

**Módulo Visits (/api/v1/visits):**
| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | / | Listar visitas | ✅ Completo |
| GET | /:id | Obtener visita | ✅ Completo |
| POST | / | Crear visita | ✅ Completo |
| PATCH | /:id | Actualizar visita | ✅ Completo |

**Módulo Tickets (/api/v1/tickets):**
| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | / | Listar tickets | ✅ Completo |
| GET | /:id | Obtener ticket | ✅ Completo |
| POST | / | Crear ticket | ✅ Completo |
| PATCH | /:id | Actualizar ticket | ✅ Completo |

**Módulo NFC Tags (/api/v1/nfc-tags):**
| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | / | Listar tags NFC | ✅ Completo |
| GET | /:id | Obtener tag | ✅ Completo |
| POST | / | Crear tag NFC | ✅ Completo |
| PATCH | /:id | Actualizar tag | ✅ Completo |
| DELETE | /:id | Eliminar tag | ✅ Completo |

**Módulo Media (/api/v1/media):**
| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| POST | /request-presigned-url | Solicitar URL | ✅ Completo |
| POST | /confirm-upload | Confirmar upload | ✅ Completo |
| GET | / | Listar archivos | ✅ Completo |
| GET | /:id | Obtener archivo | ✅ Completo |

**Módulo Notifications (/api/v1/notifications):**
| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| POST | /send | Enviar notificación | ✅ Completo |
| GET | / | Listar notificaciones | ✅ Completo |
| GET | /:id | Obtener notificación | ✅ Completo |

**Módulo Sectores/Locales (/api/v1/sectors):**
| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | / | Listar locales físicos | ✅ Completo |
| GET | /:id | Obtener local | ✅ Completo |
| GET | /:id/details | Local con máquinas y NFC | ✅ Completo |
| POST | / | Crear local | ✅ Completo |
| PATCH | /:id | Actualizar local | ✅ Completo |
| DELETE | /:id | Eliminar local | ✅ Completo |

**Módulo Ventas (/api/v1/sales):**
| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | / | Listar ventas | ✅ Completo |
| GET | /:id | Obtener venta | ✅ Completo |
| GET | /stats/summary | Estadísticas de ventas | ✅ Completo |
| POST | / | Crear venta | ✅ Completo |
| PATCH | /:id | Actualizar venta | ✅ Completo |
| DELETE | /:id | Eliminar venta | ✅ Completo |

**Otros Módulos:**
- Dashboard (/api/v1/dashboard)
- Tenants (/api/v1/tenants)
- Locations (/api/v1/locations) - *En transición*
- Work Orders (/api/v1/work-orders)
- Mermas (/api/v1/mermas)
- KPIs (/api/v1/kpis)
- Inventory (/api/v1/inventory)
- Attachments (/api/v1/attachments)

---

## 5. EL "ROADMAP" (LO QUE FALTA)

### 5.1 Pendientes Técnicos

| Prioridad | Módulo | Descripción | Estado |
|-----------|--------|-------------|--------|
| 🔴 Alta | WebSockets | Implementar comunicación en tiempo real para notificaciones push | ❌ Pendiente |
| 🔴 Alta | Reportes PDF | Generar reportes en PDF (visitas, tickets, métricas) | ❌ Pendiente |
| 🔴 Alta | Pasarelas de Pago | Integrar Stripe u otra pasarela para pagos | ❌ Pendiente |
| 🟡 Media | Optimización Queries | Optimizar queries lentas, agregar índices | ❌ Pendiente |
| 🟡 Media | Refresh Tokens | Implementar sistema de refresh token | ❌ Pendiente |
| 🟡 Media | Validación GPS | Implementar fórmula Haversine para validar ubicación | ❌ Pendiente |
| 🟢 Baja | FCM Real | Integrar Firebase Cloud Messaging real | ❌ Pendiente |
| 🟢 Baja | Email Real | Integrar SendGrid o AWS SES | ❌ Pendiente |
| 🟢 Baja | SMS Real | Integrar Twilio o AWS SNS | ❌ Pendiente |
| 🟢 Baja | Logging | Implementar Winston + Sentry | ❌ Pendiente |

### 5.2 Propuestas de Mejora - Escalabilidad

**Para soportar 10x más tráfico:**

1. **Caché con Redis:**
   - Implementar caché en consultas frecuentes
   - Sesiones de usuario en Redis
   - Invalidación de caché apropiada

2. **Base de Datos:**
   - Read replicas para consultas de lectura
   - Particionamiento de tablas grandes
   - Índices adicionales en campos de filtro
   - Conexiones pooling optimizadas

3. **API Gateway:**
   - Implementar API Gateway (NestJS Gateway o Nginx)
   - Rate limiting por usuario/tenant
   - Circuit breaker pattern

4. **Cola de Mensajes:**
   - Implementar BullMQ para procesos asíncronos
   - Procesamiento de notificaciones en background
   - Jobs programados (limpieza, reportes)

5. **Microservicios (Futuro):**
   - Separar módulos en servicios independientes
   - Comunicación via gRPC o message queues
   - Escalabilidad horizontal por módulo

6. **Optimización de Código:**
   - Lazy loading de módulos
   - Serialización eficiente de respuestas
   - Compresión de respuestas HTTP
   - Pagination en todos los endpoints

7. **Monitoreo:**
   - Métricas con Prometheus
   - Dashboards con Grafana
   - Alertas automáticas
   - Health checks detallados

8. **Seguridad Adicional:**
   - Rate limiting por IP
   -防护 de inyecciones SQL
   - Sanitización de inputs
   - Logs de auditoría

---

## 6. RESUMEN EJECUTIVO

| Aspecto | Estado |
|---------|--------|
| Stack Tecnológico | ✅ NestJS 10, TypeORM, PostgreSQL 15, Node 20 |
| Autenticación JWT | ✅ Funcional (sin refresh tokens) |
| RBAC Roles | ✅ Implementado (7 roles) |
| Multi-tenant | ✅ Aislamiento por tenant_id |
| Visitas NFC/GPS | ✅ Almacenamiento (sin validación Haversine) |
| Archivos Media | ✅ Azure Blob Storage con URLs presignadas |
| Notificaciones | ✅ Estructura (simulación FCM/Email/SMS) |
| Endpoints Principales | ✅ ~80% implementados |
| WebSockets | ❌ No implementado |
| Reportes PDF | ❌ No implementado |
| Pagos | ❌ No implementado |
| Logging/Monitoreo | ❌ No implementado |
