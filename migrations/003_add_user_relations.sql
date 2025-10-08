-- Add user_id column to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE;

-- Add user_id column to quotations table
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE;

-- Create indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
