import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../schemas/auth.schema';
import { JwtModule } from '@nestjs/jwt';
import { AccessToken } from '../lib/generateTokens';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GenerateOtp } from '../lib/generateOtp';
import { RedisModule } from '@libs/redis';
import { AuthGuard } from '../lib/authGuard';
import { JwtTokenService } from '../services/jwt-token.service';
import { NumberOtpGenerator } from '../services/number-otp.service';
import { EmailChannel } from '../channels/email.channel';
import { HashService } from '../services/hash.service';

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
        database: configService.get('POSTGRES_DB_NAME'),
      }),
    }),
    TypeOrmModule.forFeature([Auth]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        privateKey: configService
          .get('TOKEN_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
        signOptions: {
          algorithm: 'RS256',
        },
      }),
    }),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4003,
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4004,
        },
      },
    ]),
    RedisModule,
  ],
  controllers: [AuthServiceController],
  providers: [
    AuthServiceService,
    AccessToken,
    GenerateOtp,
    AuthGuard,
    { provide: 'TokenService', useClass: JwtTokenService },
    { provide: 'otpGenerator', useClass: NumberOtpGenerator },
    { provide: 'NotificationChannel', useClass: EmailChannel },
    { provide: 'HashService', useClass: HashService },
  ],
})
export class AuthServiceModule {}
