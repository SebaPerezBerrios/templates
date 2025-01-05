import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { JWTUserData } from '../../../utils/interfaces';
import { UserRepositoryService } from './repository.service';
import { RoleRepositoryService } from './role.repository';
import { RoleCreateDto, RoleUpdateDto, UserAssignRoleDto, UserCreateDto, UsersGetDto } from '../dtos';
import { UserUpdateDto } from '../dtos/user/update.user.dto';
import * as _ from 'lodash';

@Injectable()
export class UserDomainService {
  constructor(
    private readonly userRepositoryService: UserRepositoryService,
    private readonly roleRepositoryService: RoleRepositoryService
  ) {}

  async create(userCreateDto: UserCreateDto) {
    return await this.userRepositoryService.create(userCreateDto);
  }

  async update(userId: Types.ObjectId, userCreateDto: UserUpdateDto) {
    return await this.userRepositoryService.update(userId, userCreateDto);
  }

  async search(query: UsersGetDto) {
    return await this.userRepositoryService.getAll(query);
  }

  async getUserById(userId: Types.ObjectId) {
    return await this.userRepositoryService.getById(userId);
  }

  async getUserEntity(payload: JWTUserData) {
    const user = await this.userRepositoryService.getUserDataCache(payload);

    const activeTenants = _.filter(user.tenants, ({ is_active }) => is_active);

    const tenantsById = new Map(_.map(activeTenants, (tenant) => [tenant._id.toString(), tenant]));
    const tenantsByName = new Set(_.map(activeTenants, (tenant) => tenant.name));

    return {
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
  }

  async assignRole(userAssignRoleDto: UserAssignRoleDto) {
    return await this.userRepositoryService.assignRole(userAssignRoleDto);
  }

  async deleteRole(roleId: Types.ObjectId) {
    await this.userRepositoryService.deleteRole(roleId);
  }

  async createRoles(roleCreateDto: RoleCreateDto) {
    return await this.roleRepositoryService.create(roleCreateDto);
  }

  async updateRoles(roleId: Types.ObjectId, roleCreateDto: RoleUpdateDto) {
    return await this.roleRepositoryService.update(roleId, roleCreateDto);
  }

  async getRoles() {
    return await this.roleRepositoryService.getAll();
  }
}
