import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { JWTUserData, UserEntity } from '../../../utils/interfaces';
import { UserRepositoryService } from './repository.service';
import * as _ from 'lodash';

@Injectable()
export class UserAuthService {
  constructor(private readonly userRepositoryService: UserRepositoryService) {}

  async getUserEntity(payload: JWTUserData): Promise<UserEntity> {
    const user = await this.userRepositoryService.getUserDataCache(payload);

    const activeTenants = _.filter(user.tenants, ({ is_active }) => is_active);

    const tenantsById = new Map(_.map(activeTenants, (tenant) => [tenant._id.toString(), tenant]));
    const tenantsByName = new Set(_.map(activeTenants, (tenant) => tenant.name));

    const userEntity = {
      ...user,
      getTenantNameById: (tenantId: Types.ObjectId | string) => {
        const tenant = tenantsById.get(tenantId.toString());
        if (!tenant) {
          throw new NotFoundException('Tenant not available for user');
        }
        return tenant.name;
      },
      validateTenant: (tenantName: string) => {
        if (!tenantsByName.has(tenantName)) {
          throw new NotFoundException(`Tenant ${tenantName} not available for user`);
        }
        return tenantName;
      },
    };
    return userEntity;
  }
}
