import { Global, DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, Role, RoleSchema } from '../models';
import { UserRepositoryService } from '../services/repository.service';
import { RoleRepositoryService } from '../services/role.repository';
import { UserDomainService } from '../services/user.service';
import { RedisOptions } from 'ioredis';
import { LoginService } from '../services/login.service';
import { RedisModule } from '../../../infrastructure/redis';

export type UserDomainModuleConfig = {
  db_uri: string;
  redis_config: RedisOptions;
  auth_config: {
    token_expiration_minutes: number;
    jwt_private: Buffer;
  };
};

@Global()
export class UserDomainModule {
  static register(config: UserDomainModuleConfig): DynamicModule {
    const imports = [
      RedisModule.register(),
      MongooseModule.forRoot(config.db_uri),
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Role.name, schema: RoleSchema },
      ]),
    ];
    return {
      module: UserDomainModule,
      imports: imports,
      providers: [
        UserDomainService,
        UserRepositoryService,
        RoleRepositoryService,
        LoginService,
        {
          provide: 'TOKEN_EXPIRATION_MINUTES',
          useValue: config.auth_config.token_expiration_minutes,
        },
        {
          provide: 'JWT_PRIVATE',
          useValue: config.auth_config.jwt_private,
        },
      ],
      exports: [UserDomainService, UserRepositoryService],
    };
  }
}
