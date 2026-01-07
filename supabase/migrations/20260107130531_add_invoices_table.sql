-- =============================================
-- INVOICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link to source quotation (optional)
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,

  -- Invoice-specific fields
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  po_number VARCHAR(100),                    -- Client's PO reference (e.g., POMS-2512821314)
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,                    -- Payment due date
  status VARCHAR(50) DEFAULT 'draft',        -- draft, sent, paid, overdue

  -- Project info
  project_title VARCHAR(255),

  -- Company snapshot (from)
  from_company_name VARCHAR(255),
  from_company_registration VARCHAR(100),
  from_company_address TEXT,
  from_company_email VARCHAR(255),
  from_company_phone VARCHAR(50),
  from_company_logo_url TEXT,
  company_info_id UUID REFERENCES public.company_info(id) ON DELETE SET NULL,

  -- Client snapshot (to)
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_company VARCHAR(255),
  client_phone VARCHAR(50),
  client_address TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,

  -- Items and calculations (snapshotted from quotation)
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_value DECIMAL(12, 2) DEFAULT 0,
  sst_rate DECIMAL(5, 2) DEFAULT 0,          -- Malaysian SST (0% or 6%)
  sst_amount DECIMAL(12, 2) DEFAULT 0,
  shipping DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Additional info
  terms TEXT,
  notes TEXT,

  -- Bank info (MANDATORY for invoices)
  bank_name VARCHAR(255) NOT NULL,
  bank_account_number VARCHAR(100) NOT NULL,
  bank_account_name VARCHAR(255) NOT NULL,
  bank_info_id UUID REFERENCES public.bank_info(id) ON DELETE SET NULL,

  -- Payment tracking
  paid_date DATE,
  paid_amount DECIMAL(12, 2),
  payment_reference VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quotation_id ON public.invoices(quotation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_bank_info_id ON public.invoices(bank_info_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNCTION: Generate Invoice Number
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  result TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM '#INV(\d+)') AS INTEGER)
  ), 0) + 1
  INTO next_number
  FROM public.invoices;

  result := '#INV' || LPAD(next_number::TEXT, 6, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;
