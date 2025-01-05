import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

import { SetMetadata } from '@nestjs/common';
import { Dictionary, groupBy, map, mapValues, some, split } from 'lodash';
import { IS_PUBLIC_KEY } from './constants';
import { UserEntity } from '../interfaces';

export const Roles = (...roles: string[]) =>
  SetMetadata(
    'roles',
    mapValues(
      groupBy(
        map(roles, (role) => split(role, '.') as [string, string]),
        ([name]) => name
      ),
      (roles) => new Set(map(roles, ([, action]) => action))
    )
  );

@Injectable()
export class RolesAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const roles = this.reflector.get<Dictionary<Set<string>>>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserEntity;

    const { canAccess, userRoles } = this.matchRoles(roles, user.auth_scopes);
    request.userRoles = userRoles;
    return canAccess;
  }

  private matchRoles(roles: Dictionary<Set<string>>, scopes: string[]) {
    const userRoles = map(scopes, (scope) => {
      const [role, action] = split(scope, '.');
      return { role, action };
    });

    some(userRoles, ({ role, action }) => {
      const foundRole = roles[role];
      return foundRole?.has('*') || foundRole?.has(action);
    });

    return {
      canAccess: some(userRoles, ({ role, action }) => {
        const foundRole = roles[role];
        return foundRole?.has('*') || foundRole?.has(action);
      }),
      userRoles,
    };
  }
}
