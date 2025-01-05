import { Module, DynamicModule } from '@nestjs/common';
import { KeyStoreModule } from './key.store.module';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthService } from '../services/user.auth.service';
import { RedisModule } from '../../../infrastructure/redis';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema, User, UserSchema } from '../models';
import { UserRepositoryService } from '../services/repository.service';
import { RoleRepositoryService } from '../services/role.repository';
import { MongooseRootModule } from '../../../infrastructure/mongoose';

@Module({})
export class AuthModule {
  static register(): DynamicModule {
    const imports = [
      RedisModule.register(),
      MongooseRootModule.forRoot(),
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Role.name, schema: RoleSchema },
      ]),
      KeyStoreModule.register(),
      JwtModule.register({
        global: true,
      }),
    ];

    const providers = [UserRepositoryService, RoleRepositoryService, UserAuthService];

    return {
      imports,
      module: AuthModule,
      providers,
      exports: providers,
    };
  }
}
