import { Inject } from '@nestjs/common';
import { Connection, Model } from 'mongoose';

export const MONGOOSE_TENANT_CONFIG = 'MONGOOSE_TENANT_CONFIG';

export const MONGOOSE_INSTANCE = 'MONGOOSE_INSTANCE';

export const TENANT_CONNECTION_MAP = 'TENANT_CONNECTION_MAP';

export const AVAILABLE_TENANT_SET = 'AVAILABLE_TENANT_SET';

export type TenantConnectionMap = Map<
  string,
  { connection: Connection; models: Map<string, Model<any, unknown, unknown, unknown, any, any>> }
>;

export type AvailableTenantSet = Set<string>;
export const tenantSet: AvailableTenantSet = new Set();

export type TenantModel<T> = (tenant: string) => Model<T>;

export type MongooseTenantModuleConfig = {
  get_predefined_tenants: string[] | (() => string[]) | (() => Promise<string[]>);
};

export type MongooseTenantConfig = MongooseTenantModuleConfig & {
  database_prefix: string;
  db_uri: string;
};

export const InjectTenantModel = (name: string) => Inject(getModelToken(name));

export const getModelToken = (name: string) => `MONGOOSE_TENANT_MODEL_${name}`;
