// AuthController: recibe las peticiones HTTP y las delega al AuthService.
// No contiene logica de negocio, solo enruta.

import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth') // Agrupa los endpoints bajo "Auth" en Swagger
@Controller('auth') // Prefijo de ruta: /api/v1/auth
export class AuthController {
  // El constructor inyecta AuthService automaticamente (NestJS lo resuelve)
  constructor(private authService: AuthService) {}

  // POST /api/v1/auth/login
  // Recibe rut + password, devuelve JWT + datos del usuario
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesion con email y contrasena' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // POST /api/v1/auth/register
  // Crea un usuario nuevo (para pruebas y setup inicial)
  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario nuevo' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/v1/auth/change-password
  // Cambiar contraseña (requiere estar autenticado)
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    return this.authService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  // POST /api/v1/auth/forgot-password
  // Solicitar recuperación de contraseña
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({ status: 200, description: 'Se envió enlace de recuperación' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // POST /api/v1/auth/reset-password
  // Resetear contraseña con token de recuperación
  @Post('reset-password')
  @ApiOperation({ summary: 'Resetear contraseña con token' })
  @ApiResponse({ status: 200, description: 'Contraseña reseteada' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword, dto.confirmPassword);
  }

  // POST /api/v1/auth/refresh
  // Renovar JWT
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token JWT' })
  @ApiResponse({ status: 200, description: 'Token renovado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.accessToken);
  }

  // POST /api/v1/auth/logout
  // Cerrar sesión (cliente elimina token)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  logout() {
    return this.authService.logout();
  }
}