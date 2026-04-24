# BackFrío - Documentación Completa del Backend

**Versión:** 1.0  
**Última actualización:** 23 de Abril de 2026  
**Estado del Proyecto:** En Desarrollo Activo

---

## Tabla de Contenidos

1. Visión General
2. Arquitectura del Sistema
3. Stack Tecnológico
4. Configuración del Entorno
5. Estructura de Módulos
6. Modelo de Datos
7. Autenticación y Autorización
8. Mejoras Implementadas Recientemente
9. Validaciones en Endpoints Clave
10. Guía de Desarrollo
11. Conexión Frontend
12. Manejo de Errores
13. Migraciones de Base de Datos

---

## Visión General

BackFrío es una plataforma de gestión inteligente para máquinas refrigeradas y puntos de venta. El backend proporciona un sistema integral multi-tenant que gestiona:

- Autenticación y autorización con roles basados en acceso (RBAC)
- Gestión multi-tenant con aislamiento completo de datos
- Control de máquinas refrigeradas con tracking de estado
- Sistema de ventas con inventario integrado
- Gestión de ubicaciones y sectores de tiendas
- Administración de usuarios con permisos granulares
- Etiquetas NFC para identificación de máquinas
- Sistema de tickets y órdenes de trabajo
- Reportes y KPIs de desempeño
- Notificaciones en tiempo real

---

## Arquitectura del Sistema

El sistema sigue una arquitectura basada en módulos, con separación clara entre controladores (manejo de requests HTTP), servicios (lógica de negocio), guards (autenticación/autorización) y decoradores (validaciones y metadata). La capa de acceso a datos utiliza TypeORM con entidades y DTOs para transferencia de datos. La base de datos es PostgreSQL, con soporte multi-tenant y soft delete.

Principios Arquitectónicos:

- Multi-tenant: Cada usuario pertenece a un tenantId único
- Soft Delete: Registros eliminados se marcan con deleted_at, no se borran físicamente
- RBAC (Role-Based Access Control): Permisos basados en roles del usuario
- JWT Authentication: Tokens con expiración para seguridad
- Validación en Capas: DTOs + Guards + Business Logic

---

## Stack Tecnológico

Versiones Principales:

| Componente | Versión | Descripción |
|-----------|---------|------------|
| NestJS | 10.0.0 | Framework Node.js robusto |
| TypeScript | 5.1.3 | Tipado estático para JS |
| TypeORM | 0.3.17 | ORM para manejo de datos |
| PostgreSQL | 14+ | Base de datos relacional |
| Passport | 0.7.0 | Estrategia de autenticación |
| JWT | 10.0.0 | JSON Web Tokens |
| Swagger | 7.4.2 | Documentación de API |
| Socket.io | 4.7.0 | Comunicación en tiempo real |
| Class Validator | 0.14.0 | Validación de DTOs |
| Class Transformer | 0.5.1 | Transformación de objetos |

---

## Configuración del Entorno

Requisitos Previos:

- Node.js >= 18
- npm >= 9.0
- PostgreSQL >= 14
- Git

Instalación Local:

1. Clonar repositorio y entrar al directorio
2. Instalar dependencias con npm install
3. Configurar variables de entorno (.env)
4. Ejecutar migraciones
5. Iniciar servidor

Variables de Entorno Requeridas:

- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- JWT_SECRET, JWT_EXPIRATION
- NODE_ENV, APP_PORT, API_PREFIX

---

## Estructura de Módulos

Módulo de Autenticación (auth/):
- Registro e inicio de sesión de usuarios
- Validación de credenciales
- Generación de JWT tokens
- Estrategias Passport (JWT, Local)
- Cambio y recuperación de contraseña

Módulo de Usuarios (users/):
- CRUD de usuarios
- Búsqueda y filtrado
- Gestión de roles
- Validación de permisos

Módulo de Máquinas (machines/):
- CRUD de máquinas refrigeradas
- Tracking de estado y ubicación
- Asignación a usuarios y tiendas
- Histórico de cambios
- Validación de assignedUserId multi-tenant
- Derivación automática de assignedUserId desde store
- Requerimiento obligatorio de storeId
- Resolución automática de storeName

Módulo de Ubicaciones/Tiendas (locations/):
- Gestión de locales (stores)
- Información del retail (minorista)
- Coordenadas y dirección
- Relación con sectores

Módulo de Ventas (sales/):
- Registro de transacciones
- Asociación con máquinas/sectores
- Gestión de inventario
- Análisis de ingresos

Módulo de Sectores (sectors/):
- Agrupación de tiendas por región
- Información del sector
- Máquinas por sector

Módulo NFC Tags (nfc-tags/):
- Asociación de etiquetas NFC a máquinas
- Lectura y validación de UID

Módulo de Tickets (tickets/):
- Gestión de problemas reportados
- Estados y prioridades
- Asignación a técnicos

Módulo de KPIs (kpis/):
- Métricas de desempeño
- Reportes por usuario, sector y máquina

Otros módulos: work-orders, visits, notifications, media, inventory, mermas, attachments, dashboard, tenants, sync-queue.

---

## Modelo de Datos

Relaciones Principales:

- Un tenant puede tener múltiples usuarios, máquinas y tiendas.
- Cada máquina pertenece a un tenant y está asociada a una tienda y a un usuario asignado (retailer).
- Las ventas se asocian a máquinas y tiendas.

Tablas Principales:

- users: id, tenant_id, email, password_hash, roles, etc.
- machines: id, tenant_id, assigned_user_id, store_id, serial_number, etc.
- stores: id, tenant_id, sector_id, retailer_id, name, address, etc.

---

## Autenticación y Autorización

Flujo de autenticación:

1. Cliente envía credenciales a /auth/login
2. Backend valida credenciales y genera JWT
3. Cliente recibe token y lo envía en Authorization header
4. Backend valida token en cada request

Guards y Decoradores:
- @UseGuards(JwtAuthGuard): Valida JWT
- @Roles('ADMIN', 'SUPPORT'): Valida roles
- @GetUser(): Extrae usuario autenticado del JWT

---

## Mejoras Implementadas Recientemente

Cambios y Mejoras en el Endpoint de Máquinas (Abril 2026):

- Validación de assignedUserId: se valida contra la tabla users, debe pertenecer al mismo tenantId de la máquina y evita asignar máquinas a usuarios inexistentes.
- Derivación de assignedUserId desde Store: se toma automáticamente del campo retailer_id de la tienda (store), no es necesario enviarlo en la request y se resuelve en el endpoint POST /machines.
- Requerimiento de storeId: es obligatorio al crear una máquina, la tienda debe existir y pertenecer al mismo tenant, y la respuesta devuelve automáticamente storeName resuelto.

---

## Validaciones en Endpoints Clave

POST /machines - Crear Máquina:

- JWT válido requerido
- Rol ADMIN o SUPPORT
- serialNumber único por tenant
- model y status validados
- storeId obligatorio y válido
- assignedUserId derivado automáticamente
- storeName resuelto automáticamente

---

## Guía de Desarrollo

- Validar tenantId en queries
- Usar soft delete (deletedAt IS NULL)
- Validar en DTOs + Guards + Service
- Usar decorador @GetUser() para tenant automático
- Documentar endpoints en Swagger
- Manejar errores con excepciones de NestJS

---

## Conexión Frontend

- Configuración CORS en main.ts
- Base URL: http://localhost:3000/api
- Documentación: http://localhost:3000/api/docs
- Headers requeridos: Authorization, Content-Type
- Ejemplo de integración en JavaScript/TypeScript

---

## Manejo de Errores

Códigos HTTP utilizados:

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Server Error

Estructura de respuesta de error:

{
  "statusCode": 400,
  "message": "El storeId es requerido para crear la máquina",
  "error": "Bad Request"
}

---

## Migraciones de Base de Datos

- Estructura de migraciones en carpeta migrations/
- Comandos para ejecutar, revertir y generar migraciones
- Ejemplo de migración aplicada: 005_fix_user_role_enum.sql

---

## Checklist de Deployment

- Configurar variables de entorno
- Crear BD PostgreSQL
- Ejecutar migraciones
- Generar JWT_SECRET seguro
- Configurar CORS
- Activar HTTPS/TLS
- Configurar backups y logs
- Ejecutar tests
- Compilar a TypeScript
- Iniciar con PM2 o systemd
- Configurar nginx como reverse proxy
- Monitorear recursos

---

## Monitoreo y Logs

- Uso de console.log, console.warn, console.error
- Visualización de logs con PM2 o systemd

---

## Próximos Pasos

- Implementar socket.io para notificaciones
- Sincronización offline para mobile
- Reportes exportables
- Métricas de performance
- Historial de auditoría

---

## FAQ

- ¿Cómo agregar un nuevo rol? Actualizar enum en User entity y usar en decorador @Roles
- ¿Cómo cambiar expiración de JWT? Modificar JWT_EXPIRATION en .env
- ¿Puedo borrar un registro? Usar soft delete
- ¿Cómo validar un UUID? Usar @IsUUID('4') en DTO

---

## Recursos

- NestJS Docs
- TypeORM Docs
- Passport.js
- PostgreSQL Docs
- JWT.io

---

Documento generado: 23 de Abril de 2026
Estado: En Revisión
Próxima Revisión: 01 de Mayo de 2026

Para preguntas o actualizaciones, contactar al equipo de desarrollo.
