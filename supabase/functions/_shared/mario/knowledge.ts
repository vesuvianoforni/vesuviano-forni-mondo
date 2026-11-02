import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { loadCatalog } from '../marketing-catalog.ts';
import { catalogWithoutPrices } from '../marketing-policy.ts';

export async function marioKnowledge(db: SupabaseClient, language = 'en') {
  const [config, knowledge, product, catalog] = await Promise.all([
    db.from('outreach_agent_config').select('instructions,ai_status,ai_reason').eq('key', 'default').single(),
    db.from('outreach_knowledge').select('id,title,content,source_url,updated_at').eq('active', true).order('updated_at', { ascending: false }).limit(60),
    db.from('products').select('id,name,category,description,size_label,coating,component').eq('is_active', true).order('sort_order').limit(300),
    loadCatalog(db, language),
  ]);
  for (const r of [config, knowledge, product]) if (r.error) throw new Error('Conoscenze Mario non disponibili');
  if (!config.data) throw new Error('Impostazioni Mario non disponibili');
  return { config: config.data, knowledge: catalogWithoutPrices(knowledge.data ?? []), products: catalogWithoutPrices(product.data ?? []), catalog: catalogWithoutPrices(catalog) };
}