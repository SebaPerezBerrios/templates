import { DynamicModule, InternalServerErrorException, Module } from '@nestjs/common';
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
          const redisConfig = configService.get<{ host: string; username: string; password: string }>('cache');
          if (!redisConfig) {
            throw new InternalServerErrorException('Redis config missing');
          }
          const redisClient = new Redis(redisConfig.host, {
            username: redisConfig.username,
            password: redisConfig.password,
          });
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
