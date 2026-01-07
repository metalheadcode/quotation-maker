-- =============================================
-- Fix RLS Performance Warnings
-- Wrap auth.uid() in (select auth.uid()) to prevent
-- re-evaluation for each row
-- =============================================

-- =============================================
-- CLIENTS TABLE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================
-- COMPANY_INFO TABLE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can insert their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can update their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can delete their own company info" ON public.company_info;

CREATE POLICY "Users can view their own company info"
  ON public.company_info FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own company info"
  ON public.company_info FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own company info"
  ON public.company_info FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own company info"
  ON public.company_info FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================
-- QUOTATIONS TABLE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view their own quotations" ON public.quotations;
DROP POLICY IF EXISTS "Users can insert their own quotations" ON public.quotations;
DROP POLICY IF EXISTS "Users can update their own quotations" ON public.quotations;
DROP POLICY IF EXISTS "Users can delete their own quotations" ON public.quotations;

CREATE POLICY "Users can view their own quotations"
  ON public.quotations FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own quotations"
  ON public.quotations FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own quotations"
  ON public.quotations FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own quotations"
  ON public.quotations FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================
-- BANK_INFO TABLE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view their own bank info" ON public.bank_info;
DROP POLICY IF EXISTS "Users can insert their own bank info" ON public.bank_info;
DROP POLICY IF EXISTS "Users can update their own bank info" ON public.bank_info;
DROP POLICY IF EXISTS "Users can delete their own bank info" ON public.bank_info;

CREATE POLICY "Users can view their own bank info"
  ON public.bank_info FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own bank info"
  ON public.bank_info FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own bank info"
  ON public.bank_info FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own bank info"
  ON public.bank_info FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================
-- INVOICES TABLE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own invoices"
  ON public.invoices FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON public.invoices FOR DELETE
  USING ((select auth.uid()) = user_id);
