import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as _ from 'lodash';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RoleCreateDto } from '../dtos/role/create.role.dto';
import { RoleUpdateDto } from '../dtos/role/update.role.dto';
import { Role, RoleDocument } from '../models/role.model';
import { PlainDocument } from '../../../utils/types';

@Injectable()
export class RoleRepositoryService {
  constructor(@InjectModel(Role.name) private readonly RoleModel: Model<RoleDocument>) {}

  async getAll() {
    return await this.RoleModel.find({}).lean();
  }

  async create(roleCreateDto: RoleCreateDto) {
    if (await this.RoleModel.findOne({ name: roleCreateDto.name }).lean()) {
      throw new BadRequestException(`Role with name ${roleCreateDto.name} already registered`);
    }

    const role = await this.RoleModel.create(roleCreateDto);
    return role;
  }

  async update(roleId: Types.ObjectId, roleUpdateDto: RoleUpdateDto) {
    const existingRole = await this.RoleModel.findOne({
      _id: roleId,
    }).lean();
    if (!existingRole) {
      throw new BadRequestException(`Role with id ${roleId} not found`);
    }

    if (roleUpdateDto.name) {
      const sameNameRole = await this.RoleModel.findOne({
        name: roleUpdateDto.name,
      }).lean();

      if (sameNameRole) {
        throw new BadRequestException(`Role with name ${roleUpdateDto.name} already exists`);
      }
    }

    const role = await this.RoleModel.findOneAndUpdate({ _id: roleId }, roleUpdateDto, {
      new: true,
    }).lean();

    return role;
  }

  async delete(roleId: Types.ObjectId) {
    await this.RoleModel.findOneAndDelete({ _id: roleId }).lean();
  }

  async getById(role_id: string | Types.ObjectId) {
    const role = await this.RoleModel.findOne({
      _id: new Types.ObjectId(role_id),
    }).lean();

    if (!role) {
      throw new NotFoundException(`Role with id ${role_id} not found`);
    }

    return role;
  }

  async getRoleByName(name: string) {
    const role = await this.RoleModel.findOne({
      name,
    }).lean();

    if (!role) {
      throw new BadRequestException(`Role with name ${name} not found`);
    }
    return role;
  }

  calculateScopes(role?: PlainDocument<Role>): string[] {
    return _.flatMap(role?.resources, (resource) => {
      const resourceName = resource.name;
      return _.map(resource.actions, (action) => `${resourceName}.${action}`);
    });
  }
}
