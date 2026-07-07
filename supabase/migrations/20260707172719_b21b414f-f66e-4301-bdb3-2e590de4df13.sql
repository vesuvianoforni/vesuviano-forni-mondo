
DO $$
DECLARE
  col TEXT;
BEGIN
  FOREACH col IN ARRAY ARRAY['content_it','content_en','content_fr','content_de','content_es'] LOOP
    -- Strip <p>…babylovegrowth…</p> and similar single-line wrapper tags
    EXECUTE format(
      'UPDATE public.blog_posts SET %I = regexp_replace(%I, ''<(p|div|small|footer|em|span)\b[^<]*babylovegrowth[^<]*</\1>'', '''', ''gi'') WHERE %I ILIKE ''%%babylovegrowth%%'';',
      col, col, col
    );
    -- Strip <a href="…babylovegrowth.ai…">…</a>
    EXECUTE format(
      'UPDATE public.blog_posts SET %I = regexp_replace(%I, ''<a\b[^>]*babylovegrowth\.ai[^<]*</a>'', '''', ''gi'') WHERE %I ILIKE ''%%babylovegrowth%%'';',
      col, col, col
    );
    -- Strip stray plain-text mentions
    EXECUTE format(
      'UPDATE public.blog_posts SET %I = regexp_replace(%I, ''(Article|Articolo|Artikel|Art[ií]culo)[^<>\n]*BabyLoveGrowth[^<>\n]*'', '''', ''gi'') WHERE %I ILIKE ''%%babylovegrowth%%'';',
      col, col, col
    );
  END LOOP;
END $$;
