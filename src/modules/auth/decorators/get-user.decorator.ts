// get-user.decorator.ts
// Decorador personalizado para extraer el usuario del contexto de autenticación.
// El usuario viene del JWT validado por JwtStrategy
// Uso: @GetUser() user, o @GetUser('tenantId') tenantId

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica una propiedad, retornar solo esa
    if (data) {
      return user?.[data];
    }

    // Si no, retornar todo el usuario
    return user;
  },
);
