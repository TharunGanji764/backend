import { Module } from '@nestjs/common';
import { PaymentServiceController } from './payment-service.controller';
import { PaymentServiceService } from './payment-service.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Payments } from '../schemas/payments.entity';
import { StripeService } from './stripe/stripe.service';
import { PaymentsWebhookController } from './webhook.controller';

@Module({
  imports: [
    RabbitmqModule,
    ConfigModule.forRoot({
      envFilePath: 'apps/payment-service/dotenv/.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_DB_HOST'),
        port: Number(config.get('POSTGRES_DB_PORT')),
        username: config.get('POSTGRES_DB_USERNAME'),
        password: config.get('POSTGRES_DB_PASSWORD'),
        synchronize: true,
        autoLoadEntities: true,
        database: config.get('POSTGRES_DB_NAME'),
      }),
    }),
    TypeOrmModule.forFeature([Payments]),
  ],
  controllers: [PaymentServiceController, PaymentsWebhookController],
  providers: [StripeService, PaymentServiceService],
})
export class PaymentServiceModule {}
