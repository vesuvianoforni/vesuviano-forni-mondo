-- Allow authenticated users to read email history
CREATE POLICY "Authenticated users can view email history"
ON public.email_history
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admins full access
CREATE POLICY "Admins can manage email history"
ON public.email_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));