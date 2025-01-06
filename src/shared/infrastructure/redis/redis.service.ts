import { Injectable, NotFoundException } from '@nestjs/common';
import { ZodSchema, ZodTypeDef } from 'zod';
import Redis from 'ioredis';

@Injectable()
export class RedisClient extends Redis {}

@Injectable()
export class RedisService {
  constructor(private readonly redisService: RedisClient) {}

  async cachedValue<T extends object | Buffer | string | number>(key: string, fn: () => Promise<T>, ttl: number) {
    try {
      return await this.get<T>(key);
    } catch {
      const newValue = await fn();
      await this.save(key, newValue, ttl);
      return newValue;
    }
  }

  async cachedValueP<T, D extends ZodTypeDef>(
    key: string,
    fn: () => Promise<T>,
    schema: ZodSchema<T, D, unknown>,
    ttl: number
  ): Promise<T> {
    try {
      const value = await this.get(key);
      return schema.parse(value);
    } catch {
      const newValue = await fn();
      await this.save(key, newValue, ttl);
      return newValue;
    }
  }

  async save<T>(key: string, item: T, ttl: number) {
    if (typeof item === 'number' || typeof item === 'string') {
      return await this.redisService.set(key, item, 'EX', ttl);
    }
    if (Buffer.isBuffer(item)) {
      return await this.redisService.set(key, item, 'EX', ttl);
    }

    if (typeof item === 'object') {
      return await this.redisService.set(key, JSON.stringify(item), 'EX', ttl);
    }

    throw Error(`can't upload value of type ${typeof item}`);
  }

  async get<T>(key: string): Promise<T> {
    const value = await this.redisService.get(key);
    if (!value) {
      throw new NotFoundException(`Key ${key} not found`);
    }
    return JSON.parse(value) as T;
  }
}
