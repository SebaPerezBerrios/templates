import * as z from 'zod';
import { replace, toLower } from 'lodash';

export const TenantCreateDto = z.object({
  name: z
    .string()
    .min(1)
    .transform((tenant) => toLower(replace(tenant, ' ', '_'))),
  label: z.string().min(1),
});

export type TenantCreateDto = z.infer<typeof TenantCreateDto>;
