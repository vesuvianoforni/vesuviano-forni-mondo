
CREATE POLICY "Commerciale can manage burners"
ON public.burners
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role))
WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));
