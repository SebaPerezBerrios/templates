import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './constants';
import { RolesAuthGuard } from './roles.guard';
import { JwtService } from '@nestjs/jwt';
import { JWTUserData } from '../interfaces';
import { UserAuthService } from '../../domain/user/services/user.auth.service';
import { JWT_KEYS, JwtKeys } from '../../domain/user';

@Injectable()
export class JwtAuthGuardUser implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userAuthService: UserAuthService,
    @Inject(JWT_KEYS) private readonly jwtKeys: JwtKeys
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      Logger.warn('Missing auth header');
      throw new UnauthorizedException();
    }

    request['user'] = await this.getPayload(token);

    return true;
  }

  async getPayload(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JWTUserData & { iat: number; exp: number }>(token, {
        secret: this.jwtKeys['user']['public_key'],
      });

      const userData = await this.userAuthService.getUserEntity(payload);
      return userData;
    } catch (err) {
      Logger.error(err);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

export const JwtUserGuard = () => UseGuards(JwtAuthGuardUser, RolesAuthGuard);
