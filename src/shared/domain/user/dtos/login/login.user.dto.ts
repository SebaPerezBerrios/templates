import * as z from 'zod';

export const UserLoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type UserLoginDto = z.infer<typeof UserLoginDto>;
