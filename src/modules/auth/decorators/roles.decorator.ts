// roles.decorator.ts
// Decorador personalizado para marcar que roles pueden acceder a un endpoint.
// Uso: @Roles('ADMIN', 'TECHNICIAN') arriba de un metodo del controller

import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
