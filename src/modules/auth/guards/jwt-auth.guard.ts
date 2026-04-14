// jwt-auth.guard.ts
// Guard que exige que el request traiga un JWT valido.
// Si no trae token o esta expirado, devuelve 401 Unauthorized.
// Uso: @UseGuards(JwtAuthGuard) en un controller o endpoint

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
