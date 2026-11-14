ALTER TABLE public.newsletter_campaigns ADD COLUMN IF NOT EXISTS news_sources jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.roberta_news_period(p_date date)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT 'news-' || to_char(date '2026-11-14' + (floor((p_date-date '2026-11-14')::numeric/7)::integer*7), 'YYYY-MM-DD');
$$;
REVOKE ALL ON FUNCTION public.roberta_news_period(date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.roberta_news_period(date) TO service_role;

-- Maintain the already deployed callback and its authentication verbatim.
-- Only replace the old twice-monthly calendar selection; no new HTTP schedule.
DO $$
DECLARE definition text; old_branch text := 'ELSIF extract(day FROM d) IN (1,16) THEN k := to_char(d,''YYYY-MM'') || CASE WHEN extract(day FROM d)=1 THEN ''-A'' ELSE ''-B'' END;
 ELSE RETURN; END IF;';
BEGIN
 SELECT pg_get_functiondef('public.queue_roberta_run()'::regprocedure) INTO definition;
 IF position(old_branch IN definition)=0 THEN RAISE EXCEPTION 'Existing Roberta calendar does not match expected version'; END IF;
 EXECUTE replace(definition,old_branch,'ELSE k := public.roberta_news_period(d); END IF;');
END $$;