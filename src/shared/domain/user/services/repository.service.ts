import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as _ from 'lodash';
import { Model, PipelineStage, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserCachedDocument, UserDocument } from '../models/user.model';
import { RoleRepositoryService } from './role.repository';
import { Role } from '../models/role.model';
import { UserAssignRoleDto, UserCreateDto, UsersGetDto } from '../dtos';
import { UserUpdateDto } from '../dtos/user/update.user.dto';
import { Tenant } from '../../tenant';
import { filterObjectToQuery, PlainDocument, sortObjectToQuery } from '../../../utils/types';
import { hashPassword, randomString } from '../../../utils/common';
import { JWTUserData } from '../../../utils/interfaces';
import { RedisService } from '../../../infrastructure/redis';

type UserAggregate = PlainDocument<User> & {
  role?: PlainDocument<Role>;
  tenants: PlainDocument<Tenant>[];
};

@Injectable()
export class UserRepositoryService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private readonly roleRepositoryService: RoleRepositoryService,
    private readonly redisService: RedisService
  ) {}

  async getAll(query: UsersGetDto) {
    //use agregate to get all users
    if (!query) return await this.UserModel.find({}, '-password').lean();
    const users = await this.UserModel.aggregate([
      ...this.getPaginate(query),
      {
        $project: {
          password: 0,
        },
      },
    ]);

    const totalCount = await this.UserModel.aggregate(this.getCount(query));
    const total = totalCount[0]?.total || 0;
    return { data: users, limit: Number(query.limit), offset: Number(query.offset), total };
  }

  async create(userCreateDto: UserCreateDto) {
    const { email } = userCreateDto;

    if (await this.UserModel.findOne({ email }).lean()) {
      throw new BadRequestException(`User email ${userCreateDto.email} already registered`);
    }

    const userRole = await this.roleRepositoryService.getRoleByName('user');

    const { _id } = await this.saveUser({
      user: userCreateDto,
      role_id: userRole._id,
    });

    return { _id, auth_scopes: this.roleRepositoryService.calculateScopes(userRole), role: userRole };
  }

  async update(userId: Types.ObjectId, user: UserUpdateDto) {
    const existingUser = await this.UserModel.findOne({
      _id: userId,
    }).lean();

    if (!existingUser) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const updateData: Partial<UserUpdateDto> = { ...user };

    if (user.password) {
      updateData.password = await hashPassword(user.password);
    }

    const userUpdated = await this.UserModel.findOneAndUpdate(
      { _id: userId },
      {
        ...updateData,
      },
      { new: true }
    )
      .select('-password')
      .lean();

    return userUpdated;
  }

  async getById(userId: Types.ObjectId) {
    const userDocument = await this.UserModel.aggregate([
      { $match: { _id: userId } },
      ...this.makeQuery(),
      { $unset: ['password'] },
    ]);

    if (!userDocument || !userDocument.length || !userDocument[0]) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return userDocument[0];
  }

  async deleteRole(roleId: Types.ObjectId) {
    await this.roleRepositoryService.delete(roleId);
    await this.UserModel.updateMany({ role_id: roleId }, { $unset: { role_id: 1 } }).lean();
  }

  async findByEmail(email: string) {
    const existingUser = await this.UserModel.findOne({ email }).lean();
    if (!existingUser) {
      throw new NotFoundException(`User ${email} not found`);
    }
    return existingUser;
  }

  private async saveUser({
    user,
    role_id,
    is_active = true,
  }: {
    user: UserCreateDto;
    role_id: Types.ObjectId;
    is_active?: boolean;
  }) {
    const password = user.password ? user.password : randomString(32);

    const userDocument = await this.UserModel.create({
      ...user,
      is_active,
      password: await hashPassword(password),
      role_id,
    });

    return userDocument.toObject();
  }

  async getUserData(payload: JWTUserData) {
    const [user]: Omit<UserAggregate, 'password'>[] = await this.UserModel.aggregate([
      { $match: { _id: new Types.ObjectId(payload._id) } },
      ...this.makeQuery(),
      { $unset: ['password'] },
    ]);

    if (!user) {
      throw new NotFoundException(`User ${payload._id} not found`);
    }

    const auth_scopes = this.roleRepositoryService.calculateScopes(user.role);
    return { ...user, auth_scopes };
  }

  async getUserDataCache(payload: JWTUserData) {
    return await this.redisService.cachedValueP(
      `user_payload_${payload._id}`,
      () => this.getUserData(payload),
      UserCachedDocument,
      60 * 2
    );
  }

  async getUserDataLogin(email: string): Promise<UserAggregate & { auth_scopes: string[] }> {
    const [user]: UserAggregate[] = await this.UserModel.aggregate([{ $match: { email } }, ...this.makeQuery()]);

    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }

    const auth_scopes = this.roleRepositoryService.calculateScopes(user.role);
    return { ...user, auth_scopes };
  }

  async assignRole(userAssignRoleDto: UserAssignRoleDto) {
    const { user_id, role_id } = userAssignRoleDto;

    const role = await this.roleRepositoryService.getById(role_id);

    await this.UserModel.findOneAndUpdate({ _id: user_id }, { role_id: role._id }).lean();
  }

  private makeQuery(): PipelineStage[] {
    return [
      { $match: { is_active: true } },
      {
        $lookup: {
          from: 'roles',
          localField: 'role_id',
          foreignField: '_id',
          as: 'role',
        },
      },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: false } },
    ];
  }

  private getPaginate(query: UsersGetDto) {
    const { filter, map } = this.getAggregate(query);
    return [...filter, ...map, { $skip: Number(query.offset) }, { $limit: Number(query.limit) }];
  }

  private getCount(query: UsersGetDto) {
    const { filter } = this.getAggregate(query);
    return [...filter, { $count: 'total' }];
  }

  private getAggregate(query: UsersGetDto): {
    filter: PipelineStage[];
    map: PipelineStage[];
  } {
    const { text, ...filter } = query.filter;

    const filterQuery = filterObjectToQuery(filter, {});

    const textQuery = text.cata(
      () => ({}),
      (text) =>
        _.size(text.term) > 5
          ? { $text: { $search: text.term } }
          : {
              $or: [
                { name: { $regex: new RegExp(`${text.term}`), $options: 'i' } },
                { last_name: { $regex: new RegExp(`${text.term}`), $options: 'i' } },
                { email: { $regex: new RegExp(`${text.term}`), $options: 'i' } },
              ],
            }
    );

    return {
      filter: [
        {
          $match: { ...filterQuery, ...textQuery },
        },
        {
          $sort: {
            ...(text.isJust() && _.size(text.just().term) > 5 ? { score: { $meta: 'textScore' } } : {}),
            ...sortObjectToQuery(query.sort, {}),
          },
        },
      ],
      map: [
        {
          $lookup: {
            from: 'roles',
            localField: 'role_id',
            foreignField: '_id',
            as: 'role',
          },
        },
        {
          $unwind: { path: '$role', preserveNullAndEmptyArrays: true },
        },

        {
          $lookup: {
            from: 'tenants',
            localField: 'tenant_ids',
            foreignField: '_id',
            as: 'tenants',
          },
        },
      ],
    };
  }
}
