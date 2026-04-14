// jwt.strategy.ts
// Estrategia Passport que extrae y valida el JWT de cada request.
// Busca el token en el header: Authorization: Bearer <token>
// Si el token es valido, inyecta los datos del usuario en req.user

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // De donde sacar el token: del header Authorization: Bearer xxx
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // No aceptar tokens expirados
      ignoreExpiration: false,
      // La misma clave secreta que usamos para firmar en auth.service.ts
      secretOrKey: configService.get<string>('JWT_SECRET') || 'changeme',
    });
  }

  // Este metodo se ejecuta DESPUES de verificar que el token es valido.
  // Lo que retorna queda disponible como req.user en el controller.
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
