import * as z from 'zod';
import { RoleCreateDto } from './create.role.dto';

export const RoleUpdateDto = RoleCreateDto.partial();

export type RoleUpdateDto = z.infer<typeof RoleUpdateDto>;
