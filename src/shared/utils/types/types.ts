import { PipeTransform, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { Types } from 'mongoose';
import { filterType } from './dtos';

/* eslint-disable  @typescript-eslint/no-explicit-any */

export const assertNever = (x: never): never => {
  throw new Error('Unexpected object: ' + x);
};

type ListParamsFilter = {
  [key: string]: unknown;
};

type ListParamsSort = {
  [key: string]: 'asc' | 'desc';
};

export type ListParams = {
  offset?: number;
  limit?: number;
  filter?: ListParamsFilter;
  sort?: ListParamsSort;
};

@Injectable()
export class ParseQueryParams implements PipeTransform {
  transform(query: Record<string, any>) {
    return {
      ...{
        offset: 0,
        limit: 10,
        sort: { created_at: 'asc' },
        filter: {},
      },
      ...query,
    };
  }
}

export enum SORT_ORDER {
  asc = 'asc',
  desc = 'desc',
}

export type SortOrder = keyof typeof SORT_ORDER;

export const sortOrderToMongosort = (sort: SortOrder) => {
  switch (sort) {
    case 'asc':
      return 1;
    case 'desc':
      return -1;
    default:
      return assertNever(sort);
  }
};

export const sortObjectToQuery = (
  sortObject: Record<string, SortOrder>,
  translation: Record<string, string>
): Record<string, 1 | -1> => {
  const sort = _.fromPairs(
    _.map(sortObject, (value, key) => [translation[key] || key, sortOrderToMongosort(value)])
  ) as _.Dictionary<1 | -1>;
  if (_.isEmpty(sort)) return { _id: -1 };
  return { ...sort, _id: -1 };
};

export type TextSearch = { term: string };

export type FilterFieldType = string | number | boolean | Types.ObjectId | TextSearch;

export function isTextSearch(field: FilterFieldType): field is TextSearch {
  return (field as TextSearch).term !== undefined;
}

export type FilterObject = {
  [k: string]: unknown;
} & { filter_type?: filterType };

export const filterObjectToQuery = (filterObject: FilterObject, translation: Record<string, string>) => {
  const filterQuery = _.chain(filterObject)
    .toPairs()
    .filter(([key]) => key !== 'filter_type')
    .map(([key, value]) => toQueryField(value, translation[key] || key));

  if (!filterObject.filter_type || filterObject.filter_type === 'and') {
    return filterQuery.fromPairs().value();
  }
  return { $or: filterQuery.map(([key, value]) => ({ [key]: value })).value() };
};

const toQueryField = (
  values: unknown,
  key: string
): [string, { $in: unknown[] } | Record<string, { $gte: Date } | { $lte: Date }>[] | unknown] => {
  if (_.isArray(values)) {
    if (_.isDate(values[0])) {
      if (_.size(values) === 2) {
        return ['$and', [{ [key]: { $gte: values[0] as Date } }, { [key]: { $lte: values[1] as Date } }]];
      }
      return ['$and', [{ [key]: { $gte: values[0] as Date } }]];
    }
    return [key, { $in: values }];
  }
  return [key, values];
};
