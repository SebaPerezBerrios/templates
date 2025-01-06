import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepositoryService } from './repository.service';
import { UserLoginDto } from '../dtos';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords } from '../../../utils/common';
import { JWTUserData, UserEntity } from '../../../utils/interfaces';
import { JWT_KEYS, JwtKeys } from '../modules/key.store.module';

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepositoryService: UserRepositoryService,
    private readonly jwtService: JwtService,
    @Inject(JWT_KEYS) private readonly jwtKeys: JwtKeys
  ) {}

  async login(userLoginDto: UserLoginDto) {
    const userData = await this.userRepositoryService.getUserDataLogin(userLoginDto.email);

    if (!userData || !userData.password || !(await comparePasswords(userLoginDto.password, userData.password)))
      throw new UnauthorizedException('Wrong Email or Password');

    const payload = {
      _id: userData._id.toString(),
      role_id: userData.role_id?.toString(),
      role: { ...userData.role, _id: userData.role_id?.toString() },
      auth_scopes: userData.auth_scopes,
    };

    return this.createJWT(payload);
  }

  async refreshToken(user: UserEntity) {
    const { _id, auth_scopes, role_id } = user;

    return this.createJWT({ _id: _id.toString(), auth_scopes, role_id: role_id?.toString() });
  }

  private createJWT(userData: JWTUserData, first_login = false) {
    const expirationDate = this.getExpiresIn();

    const config = {
      privateKey: this.jwtKeys['user']['private_key'],
      allowInsecureKeySizes: true,
      expiresIn: 120 * 60,
    };

    const jsonWebToken = this.jwtService.sign(userData, { ...config, algorithm: 'RS512' });
    return {
      token_type: 'Bearer',
      access_token: jsonWebToken,
      first_login,
      expires_in: expirationDate,
    };
  }

  private getExpiresIn(): number {
    const expirationInSeconds = this.jwtKeys['user']['expiration_minutes'] * 60;
    const expiresIn = Math.floor(Date.now() / 1000) + expirationInSeconds;
    return expiresIn;
  }
}
