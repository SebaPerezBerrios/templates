import { createParamDecorator, ExecutionContext, InternalServerErrorException, Logger } from '@nestjs/common';

export const GetJwtData = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  if (!user) {
    Logger.error(
      `Method ${ctx.getHandler().name} from Controller ${ctx.getClass().name} missing controller/method JWT Guard`
    );
    throw new InternalServerErrorException();
  }
  return request.user;
});

export const HeaderAuthToken = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers?.authorization;
});

export const HeaderTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers?.['X-TENANT-ID'];
});

export const HeaderApiKey = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers?.['X-API-KEY'];
});
