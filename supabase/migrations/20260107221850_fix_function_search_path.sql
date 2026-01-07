-- =============================================
-- Fix Function Search Path Security Warnings
-- Sets search_path = '' for all functions to prevent
-- potential search_path injection attacks
-- =============================================

-- Fix update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Fix generate_quotation_number
ALTER FUNCTION public.generate_quotation_number() SET search_path = '';

-- Fix ensure_single_default_company
ALTER FUNCTION public.ensure_single_default_company() SET search_path = '';

-- Fix ensure_single_default_bank_info
ALTER FUNCTION public.ensure_single_default_bank_info() SET search_path = '';

-- Fix generate_invoice_number
ALTER FUNCTION public.generate_invoice_number() SET search_path = '';
