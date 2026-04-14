import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../users/entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepo: Repository<PasswordResetToken>,

    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email no encontrado');
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Contrasena incorrecta');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; tenantId: string; role: UserRole }) {
    const exists = await this.usersRepo.findOne({ where: { email: data.email } });
    if (exists) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      email: data.email,
      passwordHash: hash,
      firstName: data.firstName,
      lastName: data.lastName,
      tenantId: data.tenantId,
      role: data.role,
      active: true,
    });

    try {
      const saved = await this.usersRepo.save(user);

      return {
        id: saved.id,
        email: saved.email,
        firstName: saved.firstName,
        lastName: saved.lastName,
        role: saved.role,
      };
    } catch (err: any) {
      if (err.code === '23503') {
        throw new BadRequestException('El tenantId proporcionado no existe en la tabla tenants');
      }
      throw err;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('La nueva contraseña no puede ser igual a la actual');
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await this.usersRepo.save(user);

    return { message: 'Contraseña actualizada correctamente' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      return { message: 'Si el email existe en el sistema, recibirá un enlace de recuperación' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date(Date.now() + 3600000); // 1 hora
    await this.passwordResetTokenRepo.save({
      email,
      token: resetToken,
      expiresAt,
      used: false,
    });

    // TODO: Aquí enviar email con link: http://frontend.com/reset?token={resetToken}
    // Por ahora solo retornamos el token para testing

    return {
      message: 'Se envió un enlace de recuperación al email',
      token: resetToken, // NOTA: En producción NO retornar el token aquí
    };
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const resetToken = await this.passwordResetTokenRepo.findOne({ where: { token } });
    if (!resetToken) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('Token expirado');
    }

    if (resetToken.used) {
      throw new UnauthorizedException('Este token ya fue utilizado');
    }

    const user = await this.usersRepo.findOne({ where: { email: resetToken.email } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await this.usersRepo.save(user);

    resetToken.used = true;
    await this.passwordResetTokenRepo.save(resetToken);

    return { message: 'Contraseña reseteada correctamente. Inicia sesión con tu nueva contraseña' };
  }

  async refreshToken(accessToken: string) {
    try {
      const decoded = this.jwtService.verify(accessToken, {
        ignoreExpiration: true,
      });

      const user = await this.usersRepo.findOne({ where: { id: decoded.sub } });
      if (!user || !user.active) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      const newToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });

      return { access_token: newToken };
    } catch (err) {
      throw new UnauthorizedException('No se pudo renovar el token');
    }
  }

  async logout() {
    return { message: 'Sesión cerrada. Elimina el token del cliente.' };
  }
}

