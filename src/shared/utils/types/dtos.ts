import { z, ZodEffects, ZodObject, ZodOptional, ZodSchema, ZodType, ZodTypeAny, ZodTypeDef } from 'zod';
import * as m from 'monet';
import { PipelineStage, Types } from 'mongoose';
import { ArgumentMetadata, BadRequestException, Logger, PipeTransform } from '@nestjs/common';
import { SORT_ORDER, SortOrder, TextSearch } from './types';
import * as _ from 'lodash';

export function ZodValidate<T, R, D extends ZodTypeDef>(schema: ZodSchema<R, D, T>): PipeTransform<T, R> {
  return {
    transform: (value: T, _metadata: ArgumentMetadata) => {
      try {
        return schema.parse(value);
      } catch (error) {
        Logger.error(error);
        throw new BadRequestException(error);
      }
    },
  };
}

export function ZodValidateArray<T, R, D extends ZodTypeDef>(schema: ZodSchema<R, D, T>): PipeTransform<T, R[]> {
  return {
    transform: (value: T, _metadata: ArgumentMetadata) => {
      try {
        return z.array(schema).parse(value);
      } catch (error) {
        Logger.error(error);
        throw new BadRequestException(error);
      }
    },
  };
}

export const textSearch = z
  .string()
  .optional()
  .transform((textSearch) => {
    return m.Maybe.fromEmpty(textSearch).map<TextSearch>((textSearch) => ({
      term: textSearch,
    }));
  });

export const mongoId = z.unknown().transform((id) => {
  if (Types.ObjectId.isValid(id as string)) return new Types.ObjectId(id as string);
  throw new BadRequestException('id provided is not a valid mongoId');
});

export function filterMultipleDto<T extends ZodType>(arrayType: T) {
  return z.array(arrayType).optional();
}

export const filterType = z.enum(['and', 'or']).default('and');
export type filterType = z.infer<typeof filterType>;

export const PaginateQuery = z
  .object({
    limit: z.number({ coerce: true }),
    offset: z.number({ coerce: true }),
  })
  .partial()
  .transform(({ limit, offset }) => ({ limit, skip: offset }));

export type PaginateQuery = z.infer<typeof PaginateQuery>;

export const paginateToMongoAggregate = (paginate?: PaginateQuery): PipelineStage[] => {
  return [
    ...(!_.isUndefined(paginate?.skip) ? [{ $skip: paginate?.skip as number }] : []),
    ...(!_.isUndefined(paginate?.limit) ? [{ $limit: paginate?.limit as number }] : []),
  ];
};

export function makeQuery<T extends { [k: string]: ZodOptional<ZodTypeAny> | ZodEffects<ZodTypeAny> }>({
  filter,
  sortFields,
  defaultLimit,
  defaultOffset,
}: {
  filter: ZodObject<T>;
  sortFields: string[];
  defaultLimit?: number;
  defaultOffset?: number;
}) {
  const sortField = z.nativeEnum(SORT_ORDER);

  return z.object({
    limit: z.number({ coerce: true }).default(defaultLimit || 10),
    offset: z.number({ coerce: true }).default(defaultOffset || 0),

    filter: filter
      .partial()
      .extend({ filter_type: filterType })
      .transform((arg) => {
        return _.omitBy(arg, (value) => _.isUndefined(value) || _.isNull(value)) as typeof arg;
      }),
    sort: z
      .object(_.fromPairs(_.map(sortFields, (key) => [key, sortField])))
      .partial()
      .transform((arg) => {
        return _.omitBy(arg, (value) => _.isUndefined(value) || _.isNull(value)) as Record<string, SortOrder>;
      }),
  });
}
