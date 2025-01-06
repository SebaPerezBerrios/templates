import { Module } from '@nestjs/common';
import { EnvConfigModule } from './shared/infrastructure/config/config.module';
import { UsersModule } from './apps/users/users.module';
import { TenantsModule } from './apps/tenants/tenants.module';

@Module({
  imports: [EnvConfigModule.register(), UsersModule, TenantsModule],
})
export class AppModule {}
