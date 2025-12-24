import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { Transport } from '@nestjs/microservices';
import { AuthGuard } from '../lib/authGuard';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: { port: 4002, host: '0.0.0.0' },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 4001, () => {
    console.log(`Auth Service running on port 4001`);
  });
}
bootstrap();
