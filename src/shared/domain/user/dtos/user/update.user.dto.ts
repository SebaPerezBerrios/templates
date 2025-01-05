import * as z from 'zod';
import { UserCreateDto } from './create.user.dto';

export const UserUpdateDto = UserCreateDto.partial();
export type UserUpdateDto = z.infer<typeof UserUpdateDto>;
