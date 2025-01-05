import * as z from 'zod';

export const RoleResourceCreateDto = z.object({
  name: z.string().min(1),
  actions: z.array(z.string().min(1)).min(1),
});

export type RoleResourceCreateDto = z.infer<typeof RoleResourceCreateDto>;

export const RoleCreateDto = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  resources: z.array(RoleResourceCreateDto),
});

export type RoleCreateDto = z.infer<typeof RoleCreateDto>;
