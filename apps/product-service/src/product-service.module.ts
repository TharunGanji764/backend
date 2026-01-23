import { Module } from '@nestjs/common';
import { ProductServiceController } from './product-service.controller';
import { ProductServiceService } from './product-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/product-service/dotenv/.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
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
  ],
  controllers: [ProductServiceController],
  providers: [ProductServiceService],
})
export class ProductServiceModule {}
