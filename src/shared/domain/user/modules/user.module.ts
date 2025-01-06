import { Global, DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, Role, RoleSchema } from '../models';
import { UserRepositoryService } from '../services/repository.service';
import { RoleRepositoryService } from '../services/role.repository';
import { UserDomainService } from '../services/user.service';
import { LoginService } from '../services/login.service';
import { RedisModule } from '../../../infrastructure/redis';
import { MongooseRootModule } from '../../../infrastructure/mongoose';

@Global()
export class UserDomainModule {
  static register(): DynamicModule {
    const imports = [
      RedisModule.register(),
      MongooseRootModule.forRoot(),
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Role.name, schema: RoleSchema },
      ]),
    ];
    return {
      module: UserDomainModule,
      imports: imports,
      providers: [UserDomainService, UserRepositoryService, RoleRepositoryService, LoginService],
      exports: [UserDomainService, LoginService, UserRepositoryService],
    };
  }
}
