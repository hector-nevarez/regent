import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// One .env at the repo root, shared with docker compose.
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success){
    console.error('Invalid environment configuration:');
    for (const issue of parsed.error.issues){
        console.error(`   ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
}

export const config = parsed.data;