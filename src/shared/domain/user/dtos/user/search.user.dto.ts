import { z } from 'zod';
import { filterMultipleDto, makeQuery, mongoId, textSearch } from '../../../../utils/types';

export const UsersGetDto = makeQuery({
  filter: z.object({
    name: filterMultipleDto(z.string()),
    role_id: filterMultipleDto(mongoId),
    is_active: filterMultipleDto(z.boolean()),
    created_at: z
      .array(z.date({ coerce: true }))
      .max(2)
      .optional(),
    text: textSearch,
  }),
  sortFields: ['name', 'email', 'created_at'],
});

export type UsersGetDto = z.infer<typeof UsersGetDto>;
