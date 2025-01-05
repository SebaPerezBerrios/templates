import {
  BadRequestException,
  DynamicModule,
  Global,
  Logger,
  Module,
  NotFoundException,
  Provider,
} from '@nestjs/common';
import { ModelDefinition } from '@nestjs/mongoose';
import {
  AVAILABLE_TENANT_SET,
  AvailableTenantSet,
  MONGOOSE_TENANT_CONFIG,
  MONGOOSE_INSTANCE,
  MongooseTenantConfig,
  TENANT_CONNECTION_MAP,
  TenantConnectionMap,
  getModelToken,
} from '../constants';
import { Mongoose } from 'mongoose';
import { forEach, map } from 'lodash';

@Global()
@Module({})
export class MongooseTenantFeatureModule {
  static register(models: ModelDefinition[]): DynamicModule {
    const providers = this.getProviders(models);
    return {
      module: MongooseTenantFeatureModule,
      providers,
      exports: providers,
    };
  }

  static registerAdmin(): DynamicModule {
    const providers = [this.addTenantRegister(), this.removeTenantRegister()];
    return {
      module: MongooseTenantFeatureModule,
      providers,
      exports: providers,
    };
  }

  static addTenantRegister(): Provider {
    return {
      provide: 'ADD_TENANT',
      useFactory: (availableTenantSet: AvailableTenantSet) => (tenants: string[]) => {
        forEach(tenants, (tenant) => {
          availableTenantSet.add(tenant);
          Logger.log(`Tenant ${tenant} added at runtime`);
        });
        Logger.log(`Current tenant list ${[...availableTenantSet]}`);
      },
      inject: [AVAILABLE_TENANT_SET],
    };
  }

  static removeTenantRegister(): Provider {
    return {
      provide: 'REMOVE_TENANT',
      useFactory: (availableTenantSet: AvailableTenantSet) => (tenants: string[]) => {
        forEach(tenants, (tenant) => {
          availableTenantSet.delete(tenant);
          Logger.log(`Tenant ${tenant} removed at runtime`);
        });
        Logger.log(`Current tenant list ${[...availableTenantSet]}`);
      },
      inject: [AVAILABLE_TENANT_SET],
    };
  }

  private static getProviders(models: ModelDefinition[]): Provider[] {
    return map(models, (model) => MongooseTenantFeatureModule.getProvider(model));
  }

  private static getProvider(model: ModelDefinition): Provider {
    return {
      provide: getModelToken(model.name),
      useFactory: (
        config: MongooseTenantConfig,
        mongoose: Mongoose,
        connectionMap: TenantConnectionMap,
        availableTenantSet: AvailableTenantSet
      ) => {
        return (tenant: string) => {
          if (!tenant) {
            throw new BadRequestException('Empty tenant name');
          }

          if (!availableTenantSet.has(tenant)) {
            throw new NotFoundException(`Tenant ${tenant} not found`);
          }

          const connection = connectionMap.get(tenant);
          if (!connection) {
            return MongooseTenantFeatureModule.makeNewConnection(mongoose, config, tenant, model, connectionMap);
          }

          const existingSchema = connection.models.get(model.name);

          if (!existingSchema) {
            const newSchemaModel = connection.connection.model(model.name, model.schema);
            connection.models.set(model.name, newSchemaModel);
            return newSchemaModel;
          }

          return existingSchema;
        };
      },
      inject: [MONGOOSE_TENANT_CONFIG, MONGOOSE_INSTANCE, TENANT_CONNECTION_MAP, AVAILABLE_TENANT_SET],
    };
  }

  private static makeNewConnection(
    mongoose: Mongoose,
    config: MongooseTenantConfig,
    tenant: string,
    model: ModelDefinition,
    connectionMap: TenantConnectionMap
  ) {
    const newTenantConnection = mongoose.createConnection(config.db_uri, {
      dbName: config.database_prefix ? `${config.database_prefix}_${tenant}` : tenant,
    });

    const schemaModel = newTenantConnection.model(model.name, model.schema);

    connectionMap.set(tenant, {
      connection: newTenantConnection,
      models: new Map([[model.name, schemaModel]]),
    });
    return schemaModel;
  }
}
