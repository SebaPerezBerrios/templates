import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './constants';

export const Public = (): MethodDecorator & ClassDecorator => {
  return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      SetMetadata(IS_PUBLIC_KEY, true)(target, propertyKey, descriptor);
    } else {
      SetMetadata(IS_PUBLIC_KEY, true)(target);
      return target;
    }
  };
};
