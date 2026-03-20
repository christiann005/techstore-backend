import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('TechStore Pro API')
    .setDescription('Arquitectura de Backend E-Commerce de alto nivel para Hardware')
    .setVersion('1.0')
    .addTag('TechStore')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

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
