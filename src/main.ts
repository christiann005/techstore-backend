import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Habilitar cookie-parser para el manejo de tokens seguros
  app.use(cookieParser());

  // Habilitar CORS con credenciales permitidas para cookies
  app.enableCors({
    origin: ['http://localhost:5173'], // Puerto de Vite por defecto
    credentials: true,
  });

  // Validación global de datos (DTOs)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(3000);
  console.log('🚀 Backend running on: http://localhost:3000');
}
bootstrap();
