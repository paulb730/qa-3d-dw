import { z } from 'zod';

export const createWebPageSchema = z.object({
  user_id: z.string().uuid('user_id inválido'),
  url: z.string().url('URL inválida'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
});

export type CreateWebPageInput = z.infer<typeof createWebPageSchema>;
