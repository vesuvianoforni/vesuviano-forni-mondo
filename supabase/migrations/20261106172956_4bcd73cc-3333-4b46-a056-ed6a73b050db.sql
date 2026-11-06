CREATE OR REPLACE FUNCTION public.bruno_message_page(p_lead_id uuid, p_channel text DEFAULT NULL, p_before_at timestamptz DEFAULT NULL, p_before_id uuid DEFAULT NULL, p_limit integer DEFAULT 50)
RETURNS SETOF public.crm_messages LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT m.* FROM public.crm_messages m
  WHERE m.lead_id = p_lead_id
    AND (p_channel IS NULL
      OR (p_channel = 'whatsapp_uk' AND m.channel = 'whatsapp_api' AND m.metadata->>'whatsapp_line' = 'uk')
      OR (p_channel = 'whatsapp_api' AND m.channel = 'whatsapp_api' AND coalesce(m.metadata->>'whatsapp_line','') <> 'uk')
      OR (p_channel NOT IN ('whatsapp_uk','whatsapp_api') AND m.channel = p_channel))
    AND (p_before_at IS NULL OR (p_before_id IS NOT NULL AND (m.created_at, m.id) < (p_before_at, p_before_id)))
  ORDER BY m.created_at DESC, m.id DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 51)
$$;

CREATE OR REPLACE FUNCTION public.bruno_message_summaries(p_lead_ids uuid[])
RETURNS TABLE (lead_id uuid, message_count bigint, channel_counts jsonb, last_at timestamptz, last_contact_at timestamptz, preview text, last_channel text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH counts AS (
    SELECT m.lead_id,
      CASE WHEN m.channel='whatsapp_api' AND m.metadata->>'whatsapp_line'='uk' THEN 'whatsapp_uk' ELSE m.channel END AS channel,
      count(*) AS n, max(m.created_at) AS last_at
    FROM public.crm_messages m WHERE m.lead_id = ANY(p_lead_ids) GROUP BY 1,2
  ), totals AS (
    SELECT c.lead_id, sum(c.n)::bigint AS message_count, jsonb_object_agg(c.channel,c.n) AS channel_counts,
      max(c.last_at) FILTER (WHERE c.channel IN ('wasender','whatsapp_api','whatsapp_uk','email','call')) AS last_contact_at
    FROM counts c GROUP BY c.lead_id
  )
  SELECT t.lead_id, t.message_count, t.channel_counts, latest.created_at, t.last_contact_at, left(latest.body,90), latest.channel
  FROM totals t CROSS JOIN LATERAL (
    SELECT m.created_at, m.body, m.channel FROM public.crm_messages m WHERE m.lead_id=t.lead_id ORDER BY m.created_at DESC,m.id DESC LIMIT 1
  ) latest
$$;