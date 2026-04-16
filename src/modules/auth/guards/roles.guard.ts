// roles.guard.ts
// Guard que revisa si el usuario tiene uno de los roles permitidos.
// Se usa junto con el decorador @Roles('ADMIN', 'TECHNICIAN')
// Primero debe pasar por JwtAuthGuard (para que exista req.user)

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Leer roles definidos tanto en el metodo como en el controlador
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si el endpoint no tiene @Roles(), dejar pasar a todos los autenticados
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Sacar el usuario del request (lo puso el JwtStrategy en validate())
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    const roleSource = user.role ?? user.roles;
    const userRolesRaw = Array.isArray(roleSource) ? roleSource : [roleSource];
    const userRoles = userRolesRaw
      .filter((role) => role !== undefined && role !== null)
      .map((role) => String(role).trim().toUpperCase());

    // SUPER_ADMIN tiene acceso a todo
    if (userRoles.includes('SUPER_ADMIN')) {
      return true;
    }

    const normalizedRequiredRoles = requiredRoles.map((role) =>
      String(role).trim().toUpperCase(),
    );

    // Revisar si alguno de los roles del usuario está en la lista de permitidos
    return userRoles.some((role) => normalizedRequiredRoles.includes(role));
  }
}
