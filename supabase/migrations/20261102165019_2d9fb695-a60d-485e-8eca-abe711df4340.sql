UPDATE public.products SET is_active = false, updated_at = now()
WHERE category = 'forno' AND component = 'gas' AND (name ILIKE 'Real Bosco%' OR name ILIKE 'RealBosco%');
UPDATE public.products SET name = regexp_replace(name, ' · Legna$', ''), updated_at = now()
WHERE category = 'forno' AND component = 'base' AND (name ILIKE 'Real Bosco%' OR name ILIKE 'RealBosco%');