-- Create company_info table to store "From" company details
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
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_company_info_user_id ON company_info(user_id);
CREATE INDEX IF NOT EXISTS idx_company_info_is_default ON company_info(user_id, is_default);

-- Create a unique constraint to ensure only one default company per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_info_unique_default
ON company_info(user_id, is_default)
WHERE is_default = true;
