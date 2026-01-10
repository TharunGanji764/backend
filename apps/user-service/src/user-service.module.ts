import { Module } from '@nestjs/common';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Users } from '../schemas/user-schema';
import { Address } from '../schemas/adress.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/auth-service/dotenv/.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_DB_HOST'),
        port: Number(configService.get('POSTGRES_DB_PORT')),
        username: configService.get('POSTGRES_DB_USERNAME'),
        password: configService.get('POSTGRES_DB_PASSWORD'),
        synchronize: true,
        autoLoadEntities: true,
        entities: [Users,Address],
      }),
    }),
    TypeOrmModule.forFeature([Users,Address]),
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
