-- Create neon_auth schema for Stack Auth integration
CREATE SCHEMA IF NOT EXISTS neon_auth;

-- Create users_sync table (auto-populated by Stack Auth via Neon Auth)
CREATE TABLE IF NOT EXISTS neon_auth.users_sync (
  id VARCHAR(255) PRIMARY KEY,
  primary_email VARCHAR(255),
  primary_email_verified BOOLEAN DEFAULT FALSE,
  display_name VARCHAR(255),
  profile_image_url TEXT,
  signed_up_at TIMESTAMP,
  client_metadata JSONB,
  client_read_only_metadata JSONB,
  server_metadata JSONB,
  has_password BOOLEAN DEFAULT FALSE,
  auth_method VARCHAR(50),
  selected_team_id VARCHAR(255),
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_sync_primary_email ON neon_auth.users_sync(primary_email);
CREATE INDEX IF NOT EXISTS idx_users_sync_signed_up_at ON neon_auth.users_sync(signed_up_at);
