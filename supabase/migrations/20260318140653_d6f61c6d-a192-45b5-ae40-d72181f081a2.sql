-- Allow commerciale role to insert proformas
CREATE POLICY "Commerciale can insert proformas"
ON public.proformas
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale role to view proformas
CREATE POLICY "Commerciale can view proformas"
ON public.proformas
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale role to update proformas
CREATE POLICY "Commerciale can update proformas"
ON public.proformas
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role))
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale role to insert proforma items
CREATE POLICY "Commerciale can insert proforma items"
ON public.proforma_items
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale role to view proforma items
CREATE POLICY "Commerciale can view proforma items"  
ON public.proforma_items
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale role to update proforma items
CREATE POLICY "Commerciale can update proforma items"
ON public.proforma_items
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role))
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale role to delete proforma items
CREATE POLICY "Commerciale can delete proforma items"
ON public.proforma_items
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to view configurator ovens (needed for proforma oven selection)
-- Already public via "Anyone can view active ovens"

-- Allow commerciale to view burners (needed for proforma)
-- Already public via "Anyone can view active burners"

-- Allow commerciale to view/manage orders
CREATE POLICY "Commerciale can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to insert orders
CREATE POLICY "Commerciale can insert orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to update orders
CREATE POLICY "Commerciale can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role))
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to manage order items
CREATE POLICY "Commerciale can insert order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

CREATE POLICY "Commerciale can view order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

CREATE POLICY "Commerciale can update order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role))
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to manage configurator sessions
CREATE POLICY "Commerciale can view sessions"
ON public.configurator_sessions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

CREATE POLICY "Commerciale can insert sessions"
ON public.configurator_sessions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

CREATE POLICY "Commerciale can update sessions"
ON public.configurator_sessions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role))
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to view quotes
CREATE POLICY "Commerciale can view quotes"
ON public.configurator_quotes
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to view and manage website leads
CREATE POLICY "Commerciale can view website leads"
ON public.website_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

CREATE POLICY "Commerciale can update website leads"
ON public.website_leads
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role))
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to view email history
CREATE POLICY "Commerciale can view email history"
ON public.email_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));

-- Allow commerciale to insert email history
CREATE POLICY "Commerciale can insert email history"
ON public.email_history
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));
