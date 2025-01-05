import { DynamicModule, Provider, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as _ from 'lodash';

export type JwtKeys = Record<string, { public_key?: Buffer; private_key?: Buffer }>;
export const JWT_KEYS = 'JWT_KEYS';

@Global()
export class KeyStoreModule {
  static register(): DynamicModule {
    const providers = KeyStoreModule.getProviders();

    return {
      module: KeyStoreModule,
      providers,
      exports: providers,
    };
  }

  private static getProviders(): Provider[] {
    const providers = [
      JwtService,

      {
        provide: JWT_KEYS,
        useFactory: (configService: ConfigService) => {
          const jwtKeys = configService.get<Record<string, { public_key: string; private_key: string }>>('auth');
          return _.mapValues(jwtKeys, ({ public_key, private_key }) => ({
            public_key: public_key ? Buffer.from(public_key) : undefined,
            private_key: private_key ? Buffer.from(private_key) : undefined,
          }));
        },
        inject: [ConfigService],
      },
    ];

    return providers;
  }
}