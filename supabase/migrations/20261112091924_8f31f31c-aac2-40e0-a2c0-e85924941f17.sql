CREATE TABLE public.bruno_automations (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.bruno_automations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.bruno_automations TO authenticated;
GRANT ALL ON public.bruno_automations TO service_role;
CREATE POLICY "Staff manage bruno automations" ON public.bruno_automations FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
INSERT INTO public.bruno_automations(key) VALUES ('ready_to_ship_followup'),('telegram_summaries');