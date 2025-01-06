import { Module } from '@nestjs/common';
import { EnvConfigModule } from '../../shared/infrastructure/config/config.module';
import { AuthModule, UserDomainModule } from '../../shared/domain/user';
import { UsersController } from './users.controller';

@Module({
  imports: [EnvConfigModule.register(), AuthModule.register(), UserDomainModule.register()],
  controllers: [UsersController],
})
export class UsersModule {}
