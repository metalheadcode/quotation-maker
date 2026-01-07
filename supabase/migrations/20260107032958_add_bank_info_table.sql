-- =============================================
-- BANK INFO TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.bank_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bank_info
CREATE INDEX IF NOT EXISTS idx_bank_info_user_id ON public.bank_info(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_info_is_default ON public.bank_info(user_id, is_default);

-- Unique constraint: only one default bank account per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_info_unique_default
ON public.bank_info(user_id)
WHERE is_default = true;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.bank_info ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own bank info"
  ON public.bank_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank info"
  ON public.bank_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank info"
  ON public.bank_info FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank info"
  ON public.bank_info FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for updated_at
CREATE TRIGGER update_bank_info_updated_at
  BEFORE UPDATE ON public.bank_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to ensure only one default bank account per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_bank_info()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.bank_info
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_bank_info_trigger
  BEFORE INSERT OR UPDATE ON public.bank_info
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.ensure_single_default_bank_info();

-- =============================================
-- Add bank_info_id FK to quotations table
-- =============================================
ALTER TABLE public.quotations
ADD COLUMN IF NOT EXISTS bank_info_id UUID REFERENCES public.bank_info(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotations_bank_info_id ON public.quotations(bank_info_id);
