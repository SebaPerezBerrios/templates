import { DynamicModule, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantService } from '../services/tenant.service';
import { Tenant, TenantSchema } from '../models/tenant.model';
import { MongooseTenantModule } from '../../../infrastructure/mongoose';

export type TenantDomainModuleConfig = {
  db_uri: string;
};

@Global()
export class TenantDomainModule {
  static register(config: TenantDomainModuleConfig): DynamicModule {
    const imports = [
      MongooseModule.forRoot(config.db_uri),
      MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
      MongooseTenantModule.forRoot({ get_predefined_tenants: ['a', 'b'] }),
    ];
    return {
      module: TenantDomainModule,
      imports: imports,
      providers: [TenantService],
      exports: [...imports, TenantService],
    };
  }
}
