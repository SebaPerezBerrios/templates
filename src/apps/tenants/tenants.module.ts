import { Module } from '@nestjs/common';
import { EnvConfigModule } from '../../shared/infrastructure/config/config.module';
import { AuthModule } from '../../shared/domain/user';
import { TenantsController } from './tenants.controller';
import { TenantDomainModule } from '../../shared/domain/tenant';

@Module({
  imports: [EnvConfigModule.register(), AuthModule.register(), TenantDomainModule.register()],
  controllers: [TenantsController],
})
export class TenantsModule {}
