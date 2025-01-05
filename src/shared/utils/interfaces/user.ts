import { Types } from 'mongoose';
import { Tenant } from '../../domain/tenant';

export type UserRole = {
  _id: string;
  name: string;
  resources: Array<{
    name: string;
    actions: Array<string>;
  }>;
  created_at: string;
  updated_at: string;
};

export type UserEntity = {
  _id: string;
  auth_provider: string;
  email: string;
  name: string;
  role_id: string;
  role: UserRole;
  auth_scopes: Array<string>;
  tenants: Tenant[];
  user_countries: {
    country_code: string;
    label: string;
    brands: { name: string; business_unit: string; tenant_id: Types.ObjectId }[];
  }[];
  getTenantNameById: (id: Types.ObjectId | string) => string;
  validateTenant: (tenant: string) => string;
};

export interface JWTUserData {
  _id: string;
  auth_scopes: string[];
  role_id?: string;
}
