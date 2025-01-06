import * as z from 'zod';
import { UserCreateDto } from './create.user.dto';
import { mongoId } from '../../../../utils/types';

export const UserUpdateDto = UserCreateDto.omit({ email: true })
  .extend({ role_id: mongoId, tenant_ids: z.array(mongoId) })
  .partial();
export type UserUpdateDto = z.infer<typeof UserUpdateDto>;

export const UpdateMyUserDto = UserCreateDto.omit({ email: true }).partial();
export type UpdateMyUserDto = z.infer<typeof UpdateMyUserDto>;
