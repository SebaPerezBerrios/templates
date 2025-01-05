import * as z from 'zod';
import { mongoId } from '../../../../utils/types';

export const UserAssignRoleDto = z.object({
  user_id: mongoId,
  role_id: mongoId,
});

export type UserAssignRoleDto = z.infer<typeof UserAssignRoleDto>;
