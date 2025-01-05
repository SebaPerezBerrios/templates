import { DynamicModule, Module } from '@nestjs/common';
import { RedisClient, RedisService } from './redis.service';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Module({})
export class RedisModule {
  static register(): DynamicModule {
    const providers = [
      {
        provide: RedisClient,
        useFactory: (configService: ConfigService) => {
          const redisConfig = configService.get<string>('cache.host');
          const redisClient = new Redis(redisConfig);
          return redisClient;
        },
        inject: [ConfigService],
      },
      RedisService,
    ];
    return {
      module: RedisModule,
      providers,
      exports: providers,
    };
  }
}
