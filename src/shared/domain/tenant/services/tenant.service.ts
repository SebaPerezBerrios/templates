import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as _ from 'lodash';
import { TenantCreateDto } from '../dtos/create.tenant.dto';
import { TenantUpdateDto } from '../dtos/update.tenant.dto';
import { Tenant, TenantDocument } from '../models/tenant.model';
import { PlainDocument } from '../../../utils/types';

@Injectable()
export class TenantService {
  constructor(@InjectModel(Tenant.name) private readonly TenantModel: Model<TenantDocument>) {}

  async getTenants() {
    return await this.getActiveTenantList();
  }

  async getTenantsById(ids: (string | Types.ObjectId)[]): Promise<PlainDocument<Tenant>[]> {
    const tenants = await this.TenantModel.find({
      _id: { $in: _.map(ids, (id) => new Types.ObjectId(id)) },
      is_active: true,
    }).lean();
    if (_.isEmpty(tenants)) {
      throw new NotFoundException('Tenants not found');
    }
    return tenants;
  }

  async getTenantById(id: string | Types.ObjectId): Promise<PlainDocument<Tenant>> {
    const tenant = await this.TenantModel.findOne({
      _id: new Types.ObjectId(id),
      is_active: true,
    }).lean();
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async getTenantsByName(names: string[]): Promise<PlainDocument<Tenant>[]> {
    const tenants = await this.TenantModel.find({
      name: { $in: names },
      is_active: true,
    }).lean();
    if (_.isEmpty(tenants)) {
      throw new NotFoundException('Tenants not found');
    }
    return tenants;
  }

  async getTenantByName(name: string): Promise<PlainDocument<Tenant>> {
    const tenant = await this.TenantModel.findOne({
      name,
      is_active: true,
    }).lean();
    if (!tenant) {
      throw new NotFoundException(`Tenant ${name} not found`);
    }
    return tenant;
  }

  async addTenant(createTenantDto: TenantCreateDto) {
    const tenant = await this.TenantModel.findOneAndUpdate(
      { ...createTenantDto, is_active: true },
      { upsert: true, new: true }
    ).lean();

    return tenant;
  }

  async update(tenantId: Types.ObjectId, tenantUpdateDto: TenantUpdateDto): Promise<PlainDocument<Tenant>> {
    const tenant = await this.TenantModel.findByIdAndUpdate(tenantId, tenantUpdateDto, {
      new: true,
    }).lean();
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }
    return tenant;
  }

  async toggleTenant(tenantId: Types.ObjectId, state: 'enabled' | 'disabled'): Promise<PlainDocument<Tenant>> {
    const tenant = await this.TenantModel.findByIdAndUpdate(
      tenantId,
      { is_active: state === 'enabled' },
      {
        new: true,
      }
    ).lean();
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }
    return tenant;
  }

  async removeTenant(tenantId: Types.ObjectId) {
    const tenant = await this.TenantModel.findOneAndUpdate({ _id: tenantId }, { is_active: false });
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }
  }

  private async getActiveTenantList(): Promise<PlainDocument<Tenant>[]> {
    return await this.TenantModel.find({
      is_active: true,
    }).lean();
  }
}
