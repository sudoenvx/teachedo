import 'dotenv/config';
import { z } from 'zod';

// 1. Define the exact shape and rules of your environment variables
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3003), // coerce converts string "3000" to number 3000
    
    // Required in all environments (No defaults!)
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
    JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters long"),
    
    JWT_EXPIRES_IN: z.string().default('1h'),
    CORS_WHITELIST: z.string().optional(),
});

// 2. Validate process.env
const _env = envSchema.safeParse(process.env);

// 3. Crash the app immediately if validation fails
if (!_env.success) {
    console.error("❌ CRITICAL: Invalid environment variables:");
    console.error(_env.error.format());
    process.exit(1); // Stop Node.js from starting
}

// 4. Extract the validated data (fully typed!)
const env = _env.data;

// 5. Export your configs using the safe `env` object
export const DatabaseConfig = {
    database_url: env.DATABASE_URL
};

export const CorsConfig = {
    whitelist: env.CORS_WHITELIST?.split(',').map((origin) => origin.trim()) || [],
    credentials: true,
};

export const AppConfig = {
    environment: env.NODE_ENV,
    port: env.PORT,
};

export const JwtConfig = {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
};