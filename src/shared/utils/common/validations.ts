import { NotFoundException } from '@nestjs/common';
import { filter, map } from 'lodash';
import * as m from 'monet';

export function getOrThrow<T>(data: Record<string, NonNullable<T>>, key: string, error?: Error) {
  const value = data[key];
  if (value === undefined || value === null) {
    if (error) throw error;
    throw new NotFoundException(`key not found`);
  }
  return value;
}

export function getM<T extends NonNullable<unknown>>(data: Record<string, NonNullable<T>>, key: string): m.Maybe<T> {
  const value = data[key];
  return m.Maybe.fromNull(value);
}

export function filterM<T extends NonNullable<unknown>>(data: m.Maybe<T>[]): T[] {
  return map(
    filter(data, (value) => value.isJust()),
    (value) => value.just()
  );
}
