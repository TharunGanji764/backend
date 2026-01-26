import { Module } from '@nestjs/common';
import { CartServiceController } from './cart-service.controller';
import { CartServiceService } from './cart-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cart } from '../schemas/cart.entity';
import { CartItem } from '../schemas/cart-item.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/cart-service/dotenv/.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_DB_HOST'),
        port: Number(configService.get('POSTGRES_DB_PORT')),
        username: configService.get('POSTGRES_DB_USERNAME'),
        password: configService.get('POSTGRES_DB_PASSWORD'),
        synchronize: true,
        autoLoadEntities: true,
        database: configService.get('POSTGRES_DB_NAME'),
      }),
    }),
    TypeOrmModule.forFeature([Cart, CartItem]),

    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4005,
        },
      },
    ]),
  ],
  controllers: [CartServiceController],
  providers: [CartServiceService],
})
export class CartServiceModule {}
