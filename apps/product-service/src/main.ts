import { NestFactory } from '@nestjs/core';
import { ProductServiceModule } from './product-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: 4005,
      },
    },
  );
  console.log('product service is running on port 4005');
  await app.listen();
}
bootstrap();
