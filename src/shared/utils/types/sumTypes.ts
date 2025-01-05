import { z, ZodObject, ZodRawShape } from 'zod';

export function toTagged<T extends ZodRawShape, P extends string>(object: ZodObject<T>, type: P) {
  return object.extend({
    __TYPE__: z.literal(type),
  });
}

export type Tagged<T, K extends string> = {
  [K in Exclude<keyof T, '__TYPE__'>]: T[K];
} & { __TYPE__: K };
