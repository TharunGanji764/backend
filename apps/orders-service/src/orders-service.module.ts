import { Module } from '@nestjs/common';
import { OrdersServiceController } from './orders-service.controller';
import { OrdersServiceService } from './orders-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from '../schemas/orders.entity';
import { OrderAddress } from '../schemas/order-address.entity';
import { OrderItems } from '../schemas/order-items.entity';
import { OrderPayment } from '../schemas/order-payment';
import { OrderStatusHistory } from '../schemas/order-status-history.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/orders-service/dotenv/.env',
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
    TypeOrmModule.forFeature([
      Orders,
      OrderAddress,
      OrderItems,
      OrderPayment,
      OrderStatusHistory,
    ]),
    ClientsModule.register([
      {
        name: 'CART_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4006,
        },
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4004,
        },
      },
    ]),
  ],
  controllers: [OrdersServiceController],
  providers: [OrdersServiceService],
})
export class OrdersServiceModule {}
