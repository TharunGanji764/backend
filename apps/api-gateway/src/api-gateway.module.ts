import { Module } from '@nestjs/common';
import { AuthGatewayController } from './controllers/auth-gateway.controller';
import { AuthGatewayService } from './services/auth-gateway.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../lib/authguard';
import { UserGatewayController } from './controllers/user-gateway.controller';
import { UserGatewayService } from './services/user-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from '@libs/redis';
import { ProductsController } from './controllers/products-gateway.controller';
import { ProductGatewayService } from './services/product-gateway.service';
import { CartController } from './controllers/cart-gateway.controller';
import { CartGatewayService } from './services/cart-gateway.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
    ConfigModule.forRoot({
      envFilePath: 'apps/api-gateway/dotenv/.env',
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        publicKey: configService.get('TOKEN_PUBLIC_KEY').replace(/\\n/g, '\n'),
        verifyOptions: {
          algorithms: ['RS256'],
        },
      }),
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4004,
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4005,
        },
      },
      {
        name: 'CART_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4006,
        },
      },
    ]),

    RedisModule,
  ],
  controllers: [
    AuthGatewayController,
    UserGatewayController,
    ProductsController,
    CartController,
  ],
  providers: [
    AuthGatewayService,
    AuthGuard,
    UserGatewayService,
    ProductGatewayService,
    CartGatewayService,
  ],
})
export class ApiGatewayModule {}
