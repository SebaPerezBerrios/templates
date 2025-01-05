export type PaginatedResponse<T> = {
  data: T[];
  limit: number;
  offset: number;
};
