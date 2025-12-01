-- Fix RLS on configurator_quotes so anonymous inserts are allowed while admins can manage quotes

-- Drop existing ALL-policy for admins
DROP POLICY IF EXISTS "Admins can manage all quotes" ON public.configurator_quotes;

-- Recreate admin policies without affecting INSERT
CREATE POLICY "Admins can view all quotes"
ON public.configurator_quotes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all quotes"
ON public.configurator_quotes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all quotes"
ON public.configurator_quotes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));