WITH best_stage AS (
  SELECT DISTINCT ON (lower(cs.customer_email))
    lower(cs.customer_email) AS email,
    cs.pipeline_stage
  FROM public.configurator_sessions cs
  WHERE cs.customer_email IS NOT NULL AND cs.customer_email <> ''
  ORDER BY lower(cs.customer_email),
    CASE cs.pipeline_stage
      WHEN 'vinto' THEN 5
      WHEN 'perso' THEN 4
      WHEN 'trattativa' THEN 3
      WHEN 'qualificato' THEN 2
      ELSE 1
    END DESC,
    cs.created_at DESC
)
UPDATE public.leads l
SET status = bs.pipeline_stage
FROM best_stage bs
WHERE lower(l.email) = bs.email
  AND l.status = 'nuovo'
  AND bs.pipeline_stage <> 'nuovo';