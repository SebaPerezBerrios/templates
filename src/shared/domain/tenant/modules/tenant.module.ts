import { DynamicModule, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantService } from '../services/tenant.service';
import { Tenant, TenantSchema } from '../models/tenant.model';
import { MongooseRootModule, MongooseTenantModule } from '../../../infrastructure/mongoose';

@Global()
export class TenantDomainModule {
  static register(): DynamicModule {
    const imports = [
      MongooseRootModule.forRoot(),
      MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
      MongooseTenantModule.forRoot({ get_predefined_tenants: ['company_a', 'company_b'] }),
    ];
    return {
      module: TenantDomainModule,
      imports: imports,
      providers: [TenantService],
      exports: [...imports, TenantService],
    };
  }
}
