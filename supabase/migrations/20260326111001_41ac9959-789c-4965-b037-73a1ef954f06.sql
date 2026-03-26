CREATE POLICY "Commerciale can update configurator ovens"
ON public.configurator_ovens
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role))
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));