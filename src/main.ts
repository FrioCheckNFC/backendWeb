import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Determinar origin según ambiente
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigin = isProd 
    ? process.env.CORS_ORIGIN || 'https://tu-dominio.com'
    : 'http://localhost:4200';

  // 1. Habilitar CORS PRIMERO (antes que otros middlewares)
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'Accept-Language',
    ],
    exposedHeaders: ['Content-Length', 'X-Total-Count', 'Authorization'],
    maxAge: 86400,
  });

  // 2. Prefijo global: Todas tus rutas empezaran con /api/v1
  app.setGlobalPrefix('api/v1');

  // 3. Validacion automatica: rechaza requests que no cumplan las reglas del DTO
  // whitelist:true elimina campos que no esten definidos en el DTO (seguridad)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 4. Configuración de Swagger: El "contrato" para el de Móvil
  const config = new DocumentBuilder()
    .setTitle('FrioCheck API')
    .setDescription('Documentación oficial para los equipos de Móvil y Web')
    .setVersion('1.0')
    .addBearerAuth() // Para cuando usemos tokens JWT
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  // 5. Arrancar en el puerto del .env o 3000 por defecto
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`✅ Servidor escuchando en puerto ${port}`);
  logger.log(`📚 Swagger disponible en http://localhost:${port}/api`);
  logger.log(`🔐 CORS habilitado para: ${corsOrigin}`);
}
bootstrap();