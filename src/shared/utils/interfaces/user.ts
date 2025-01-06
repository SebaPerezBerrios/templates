import { Types } from 'mongoose';
import { Tenant } from '../../domain/tenant';

export type UserRoleEntity = {
  _id: Types.ObjectId;
  name: string;
  resources: Array<{
    name: string;
    actions: Array<string>;
  }>;
};

export type UserEntity = {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role_id?: Types.ObjectId;
  role?: UserRoleEntity;
  auth_scopes: Array<string>;
  tenants: Tenant[];
  getTenantNameById: (id: Types.ObjectId | string) => string;
  validateTenant: (tenant: string) => string;
};

export interface JWTUserData {
  _id: string;
  auth_scopes: string[];
  role_id?: string;
}
