import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'qa_engineer', 'viewer']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  avatar_url: z.string().url().optional(),
  role: z.enum(['admin', 'qa_engineer', 'viewer']).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('ID de usuario inválido'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
