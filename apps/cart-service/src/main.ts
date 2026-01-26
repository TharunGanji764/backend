import { NestFactory } from '@nestjs/core';
import { CartServiceModule } from './cart-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CartServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: 4006,
      },
    },
  );
  await app.listen();
  console.log('Cart service is listening on port 4006');
}
bootstrap();
