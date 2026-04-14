import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // Habilita Passport con estrategia JWT por defecto
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Da acceso a los repositorios dentro de este modulo
    TypeOrmModule.forFeature([User, PasswordResetToken]),

    // Configura JWT de forma ASINCRÓNICA para esperar a ConfigModule
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'changeme',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  // JwtStrategy debe estar en providers para que Passport la encuentre
  providers: [AuthService, JwtStrategy],
  // Exportamos para que otros modulos puedan usar JwtAuthGuard y AuthService
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
