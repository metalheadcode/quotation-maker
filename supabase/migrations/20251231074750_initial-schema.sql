-- =============================================
-- Quotation Maker - Initial Schema Migration
-- =============================================

-- =============================================
-- CLIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  is_favorite BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_is_favorite ON public.clients(user_id, is_favorite);

-- =============================================
-- COMPANY INFO TABLE (From address)
-- =============================================
CREATE TABLE IF NOT EXISTS public.company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  address TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  logo_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for company_info
CREATE INDEX IF NOT EXISTS idx_company_info_user_id ON public.company_info(user_id);
CREATE INDEX IF NOT EXISTS idx_company_info_is_default ON public.company_info(user_id, is_default);

-- Unique constraint: only one default company per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_info_unique_default
ON public.company_info(user_id)
WHERE is_default = true;

-- =============================================
-- QUOTATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  company_info_id UUID REFERENCES public.company_info(id) ON DELETE SET NULL,
  quotation_number VARCHAR(50) UNIQUE NOT NULL,
  project_title VARCHAR(255),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,

  -- Client snapshot (stored at time of quotation creation)
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_company VARCHAR(255),
  client_phone VARCHAR(50),
  client_address TEXT,

  -- Company snapshot (stored at time of quotation creation)
  from_company_name VARCHAR(255),
  from_company_registration VARCHAR(100),
  from_company_address TEXT,
  from_company_email VARCHAR(255),
  from_company_phone VARCHAR(50),
  from_company_logo_url TEXT,

  -- Items and calculations
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed' or 'percentage'
  discount_value DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Additional info
  terms TEXT,
  notes TEXT,
  bank_name VARCHAR(255),
  bank_account_number VARCHAR(100),
  bank_account_name VARCHAR(255),

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, accepted, rejected, expired

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for quotations
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON public.quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON public.quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_number ON public.quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON public.quotations(date);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Company info policies
CREATE POLICY "Users can view their own company info"
  ON public.company_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company info"
  ON public.company_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company info"
  ON public.company_info FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company info"
  ON public.company_info FOR DELETE
  USING (auth.uid() = user_id);

-- Quotations policies
CREATE POLICY "Users can view their own quotations"
  ON public.quotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotations"
  ON public.quotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotations"
  ON public.quotations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotations"
  ON public.quotations FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON public.company_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate quotation number
CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  next_number INTEGER;
  result TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(quotation_number FROM 'QT-' || year_part || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO next_number
  FROM public.quotations
  WHERE quotation_number LIKE 'QT-' || year_part || '-%';

  result := 'QT-' || year_part || '-' || LPAD(next_number::TEXT, 4, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure only one default company per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_company()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.company_info
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_company_trigger
  BEFORE INSERT OR UPDATE ON public.company_info
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.ensure_single_default_company();
