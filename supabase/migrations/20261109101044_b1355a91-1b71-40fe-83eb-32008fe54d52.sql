ALTER TABLE public.transport_carriers ADD COLUMN served_areas text[] NOT NULL DEFAULT '{}';
UPDATE public.transport_carriers SET served_areas = CASE WHEN country = 'Da definire' THEN ARRAY[]::text[] ELSE ARRAY[country] END;

WITH imported AS (
 SELECT *, row_number() OVER (PARTITION BY lower(btrim(name)), COALESCE(company,''), COALESCE(phone,''), COALESCE(email,'') ORDER BY created_at,id) AS position
 FROM public.transport_carriers
 WHERE strpos(notes,'Source: Trasporti_Campania_Europa.xlsx, 2026-11-09') > 0
), consolidated AS (
 SELECT k.id,
 COALESCE((SELECT array_agg(DISTINCT s.country ORDER BY s.country) FILTER (WHERE s.country <> 'Da definire') FROM imported s WHERE lower(btrim(s.name))=lower(btrim(k.name)) AND COALESCE(s.company,'')=COALESCE(k.company,'') AND COALESCE(s.phone,'')=COALESCE(k.phone,'') AND COALESCE(s.email,'')=COALESCE(k.email,'')),ARRAY[]::text[]) AS areas,
 CASE WHEN (SELECT count(*) FROM imported s WHERE lower(btrim(s.name))=lower(btrim(k.name)) AND COALESCE(s.company,'')=COALESCE(k.company,'') AND COALESCE(s.phone,'')=COALESCE(k.phone,'') AND COALESCE(s.email,'')=COALESCE(k.email,''))=1 THEN k.notes
 ELSE split_part(k.notes,E'\nArea:',1) || E'\n\n' ||
 (SELECT string_agg(s.country || E'\nArea:' || split_part(split_part(s.notes,E'\nArea:',2),E'\nPer un forno',1),E'\n\n' ORDER BY s.country) FROM imported s WHERE lower(btrim(s.name))=lower(btrim(k.name)) AND COALESCE(s.company,'')=COALESCE(k.company,'') AND COALESCE(s.phone,'')=COALESCE(k.phone,'') AND COALESCE(s.email,'')=COALESCE(k.email,'')) ||
 E'\n\nPer un forno confermare CAP, peso, misure imballate, mezzo e scarico. Le tratte alimentari sono contatti per risalire al vettore; idoneità al trasporto dei forni non ancora confermata.\nSource: Trasporti_Campania_Europa.xlsx, 2026-11-09, Contatti + Paesi e tratte.' END AS merged_notes
 FROM imported k WHERE position=1
)
UPDATE public.transport_carriers t SET served_areas=c.areas,country=COALESCE(c.areas[1],'Da definire'),notes=c.merged_notes FROM consolidated c WHERE t.id=c.id;

WITH ranked AS (
 SELECT id,row_number() OVER (PARTITION BY lower(btrim(name)),COALESCE(company,''),COALESCE(phone,''),COALESCE(email,'') ORDER BY created_at,id) AS position
 FROM public.transport_carriers WHERE strpos(notes,'Source: Trasporti_Campania_Europa.xlsx, 2026-11-09')>0
)
DELETE FROM public.transport_carriers t USING ranked r WHERE t.id=r.id AND r.position>1;

DO $$
BEGIN
 IF (SELECT count(*) FROM public.transport_carriers WHERE strpos(notes,'Source: Trasporti_Campania_Europa.xlsx, 2026-11-09')>0)<>21 THEN RAISE EXCEPTION 'Attesi 21 operatori consolidati'; END IF;
 IF (SELECT sum(cardinality(served_areas)) FROM public.transport_carriers WHERE strpos(notes,'Source: Trasporti_Campania_Europa.xlsx, 2026-11-09')>0)<>128 THEN RAISE EXCEPTION 'Le 128 associazioni alle aree devono essere conservate'; END IF;
 IF EXISTS(SELECT 1 FROM public.transport_carriers WHERE strpos(notes,'Source: Trasporti_Campania_Europa.xlsx, 2026-11-09')>0 AND is_active) THEN RAISE EXCEPTION 'I vettori importati devono restare non attivi'; END IF;
END $$;