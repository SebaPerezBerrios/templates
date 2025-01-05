import * as z from 'zod';
import { TenantCreateDto } from './create.tenant.dto';

export const TenantUpdateDto = TenantCreateDto.merge(z.object({ is_active: z.boolean() })).partial();

export type TenantUpdateDto = z.infer<typeof TenantUpdateDto>;
