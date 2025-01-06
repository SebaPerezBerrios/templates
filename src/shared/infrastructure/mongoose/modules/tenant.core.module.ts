import { DynamicModule, Global, InternalServerErrorException, Module, Provider } from '@nestjs/common';
import {
  AVAILABLE_TENANT_SET,
  MONGOOSE_TENANT_CONFIG,
  MONGOOSE_INSTANCE,
  MongooseTenantConfig,
  TENANT_CONNECTION_MAP,
  TenantConnectionMap,
  tenantSet,
  MongooseTenantModuleConfig,
} from '../constants';
import { Mongoose } from 'mongoose';
import { forEach, isArray } from 'lodash';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class MongooseTenantCoreModule {
  static async register(config: MongooseTenantModuleConfig): Promise<DynamicModule> {
    const tenantList = config?.get_predefined_tenants
      ? isArray(config.get_predefined_tenants)
        ? config.get_predefined_tenants
        : await config.get_predefined_tenants()
      : [];

    const mongooseConfig = this.createMongooseConfig(config);
    const mongooseInstance = this.createMongooseInstance();
    const mongooseConnectionMap = this.createMongooseConnectionMap();
    const availableTenantSet = this.createAvailableTenantSet(tenantList);

    const providerList = [mongooseConfig, mongooseInstance, mongooseConnectionMap, availableTenantSet];
    return {
      module: MongooseTenantCoreModule,
      imports: [],
      providers: providerList,
      exports: providerList,
    };
  }

  private static createMongooseInstance(): Provider {
    return {
      provide: MONGOOSE_INSTANCE,
      useFactory: () => {
        return new Mongoose();
      },
    };
  }

  private static createMongooseConnectionMap(): Provider {
    return {
      provide: TENANT_CONNECTION_MAP,
      useFactory: (): TenantConnectionMap => new Map(),
    };
  }

  private static createAvailableTenantSet(tenants: string[]): Provider {
    forEach(tenants, (tenant) => {
      tenantSet.add(tenant);
    });

    return {
      provide: AVAILABLE_TENANT_SET,
      useValue: tenantSet,
    };
  }

  private static createMongooseConfig(config: MongooseTenantModuleConfig): Provider {
    return {
      provide: MONGOOSE_TENANT_CONFIG,
      useFactory: (configService: ConfigService): MongooseTenantConfig => {
        const mongooseConfig = configService.get<{ host: string; db_name: string; tenant_prefix: string }>('database');

        if (!mongooseConfig) {
          throw new InternalServerErrorException('Mongodb config missing');
        }

        return {
          ...config,
          database_prefix: mongooseConfig.tenant_prefix,
          db_uri: mongooseConfig.host,
        };
      },
      inject: [ConfigService],
    };
  }
}
