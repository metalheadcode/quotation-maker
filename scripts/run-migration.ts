import { neon } from '@neondatabase/serverless';

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('Running migration: 004_create_company_info.sql');

    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS company_info (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        registration_number VARCHAR(100),
        address TEXT NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_company_info_user_id ON company_info(user_id)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_company_info_is_default ON company_info(user_id, is_default)`;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_company_info_unique_default
      ON company_info(user_id, is_default)
      WHERE is_default = true
    `;

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
