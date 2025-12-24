import { Module } from '@nestjs/common';
import Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'REDIS_OTP_DB',
      useFactory: () => {
        return new Redis({
          host: '127.0.0.1',
          port: 6379,
          db: 1,
        });
      },
    },
  ],
  exports: ['REDIS_OTP_DB'],
})
export class RedisModule {}
