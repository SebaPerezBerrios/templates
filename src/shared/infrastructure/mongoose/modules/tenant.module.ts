import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModelDefinition } from '@nestjs/mongoose';
import { MongooseTenantModuleConfig } from '../constants';
import { MongooseTenantCoreModule } from './tenant.core.module';
import { MongooseTenantFeatureModule } from './tenant.feature.module';

@Global()
@Module({})
export class MongooseTenantModule {
  static forRoot(config: MongooseTenantModuleConfig): DynamicModule {
    return {
      module: MongooseTenantModule,
      imports: [MongooseTenantCoreModule.register(config)],
    };
  }

  static forAdmin() {
    return {
      module: MongooseTenantModule,
      imports: [MongooseTenantFeatureModule.registerAdmin()],
    };
  }

  static forFeature(models?: ModelDefinition[]) {
    return {
      module: MongooseTenantModule,
      imports: [MongooseTenantFeatureModule.register(models || [])],
    };
  }
}
