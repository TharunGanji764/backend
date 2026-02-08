import { NestFactory } from '@nestjs/core';
import { PaymentServiceModule } from './payment-service.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(PaymentServiceModule);

  app.use(
    '/payments/webhook',
    bodyParser.raw({
      type: 'application/json',
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 4008,
    },
  });

  await app.startAllMicroservices();
  await app.listen(4010);
}
bootstrap();
