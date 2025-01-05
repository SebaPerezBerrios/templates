import * as z from 'zod';

export const UserCreateDto = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(1).optional(),
});

export type UserCreateDto = z.infer<typeof UserCreateDto>;
