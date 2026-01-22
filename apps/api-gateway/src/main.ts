import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { ApiGatewayExceptionFilter } from '../lib/exception-filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('🚀 api-gateway SERVICE bootstrap started');
  const app = await NestFactory.create(ApiGatewayModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ApiGatewayExceptionFilter());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
