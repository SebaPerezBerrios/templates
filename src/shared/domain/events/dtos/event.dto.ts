import { z } from 'zod';

export const EventDto = z.object({
  value: z.object({ event: z.string(), message: z.string() }),
  key: z.string().optional(),
});

export type EventDto = z.infer<typeof EventDto>;
