import { z } from 'zod';

export const createE2eTestSchema = z.object({
  user_id: z.string().uuid('user_id inválido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  canvas_config_json: z.record(z.unknown()).optional(),
});

export const updateE2eTestSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  canvas_config_json: z.record(z.unknown()).optional(),
});

export type CreateE2eTestInput = z.infer<typeof createE2eTestSchema>;
export type UpdateE2eTestInput = z.infer<typeof updateE2eTestSchema>;
