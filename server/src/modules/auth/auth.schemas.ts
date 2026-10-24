import { z } from 'zod';

// Normalize first, then validate the normalized value
const emailSchema = z.string()
                    .trim()
                    .toLowerCase()
                    .pipe(z.email().max(254));

export const registerSchema = z.object({
    email: emailSchema,
    password: z.string().min(12).max(200),
    displayName: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1).max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;