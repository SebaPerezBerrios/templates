import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Public } from '../../shared/utils/guards/public';
import {
  LoginService,
  UpdateMyUserDto,
  UserCreateDto,
  UserDomainService,
  UserLoginDto,
  UserUpdateDto,
} from '../../shared/domain/user';
import { JwtUserGuard, Roles } from '../../shared/utils/guards';
import { MongoIdPipe, ZodValidate } from '../../shared/utils/types';
import { GetJwtData } from '../../shared/utils/decorators';
import { UserEntity } from '../../shared/utils/interfaces';
import { Types } from 'mongoose';

@JwtUserGuard()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UserDomainService,
    private readonly loginService: LoginService
  ) {}

  @Public()
  @Post('signup')
  signUp(@Body(ZodValidate(UserCreateDto)) userLoginDto: UserCreateDto) {
    return this.usersService.create(userLoginDto);
  }

  @Public()
  @Post('login')
  login(@Body(ZodValidate(UserLoginDto)) userLoginDto: UserLoginDto) {
    return this.loginService.login(userLoginDto);
  }

  @Get('user-data')
  @Roles('api.consume')
  userData(@GetJwtData() userEntity: UserEntity) {
    return userEntity;
  }

  @Put(':user_id/update')
  @Roles('users.update')
  updateUser(
    @Param('user_id', MongoIdPipe) userId: Types.ObjectId,
    @Body(ZodValidate(UserUpdateDto)) userUpdateDto: UserUpdateDto
  ) {
    return this.usersService.update(userId, userUpdateDto);
  }

  @Put('update')
  @Roles('api.consume')
  updateMyUser(
    @GetJwtData() userEntity: UserEntity,
    @Body(ZodValidate(UpdateMyUserDto)) userUpdateDto: UpdateMyUserDto
  ) {
    return this.usersService.update(userEntity._id, userUpdateDto);
  }
}
