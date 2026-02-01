import { NestFactory } from '@nestjs/core';
import { OrdersServiceModule } from './orders-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  console.log('Orders service is running on port 4007');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: 4007,
      },
    },
  );
  await app.listen();
}
bootstrap();
