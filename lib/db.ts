import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Initialize Neon serverless SQL client
export const sql = neon(process.env.DATABASE_URL);
