import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.url('Invalid MongoDB URI'),
  MAILJET_API_KEY: z.string().min(1, 'Mailjet API key is required'),
  MAILJET_API_SECRET: z.string().min(1, 'Mailjet secret key is required'),
  JWT_SECRET: z.string().min(5, 'JWT secret must be at least 5 characters'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  NEXT_PUBLIC_BASE_URL: z.url('Invalid base URL'),  
  
  DONT_SEND_EMAILS: z.string().optional().transform(val => val?.toLowerCase() === 'true'),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}

// Export validated environment variables
const env = validateEnv();

export const {
  MONGODB_URI,
  MAILJET_API_KEY,
  MAILJET_API_SECRET,
  JWT_SECRET,
  NODE_ENV,
  NEXT_PUBLIC_BASE_URL,
  DONT_SEND_EMAILS,
} = env;

// Environment type for better TypeScript support
export type Environment = typeof env;

// Helper functions
export const isDevelopment = NODE_ENV === 'development';
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';
  