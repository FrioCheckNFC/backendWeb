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
    // Leer los roles permitidos del decorador @Roles()
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    // Si el endpoint no tiene @Roles(), dejar pasar a todos los autenticados
    if (!requiredRoles) {
      return true;
    }

    // Sacar el usuario del request (lo puso el JwtStrategy en validate())
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // SUPER_ADMIN tiene acceso a todo
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Manejar tanto cuando user.role es un array como cuando es un string
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    
    // Revisar si alguno de los roles del usuario está en la lista de permitidos
    return userRoles.some((role: string) => requiredRoles.includes(role));
  }
}
