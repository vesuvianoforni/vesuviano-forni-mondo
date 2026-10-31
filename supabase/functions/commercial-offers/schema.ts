import { z } from 'npm:zod@3';
import { OFFER_LANGUAGES, OFFER_CURRENCIES } from './domain.ts';
const Text = z.string().max(5000);
const Url = z.union([z.literal(''), z.string().url().max(2048).refine(value => value.startsWith('https://'), 'Usare un URL HTTPS')]);
const Company = z.object({ label: Text, name: Text, vat: Text, address: Text, ownership: Text, bank_holder: Text, bank_name: Text, bank_iban: Text, bank_extra: Text });
const Configuration = {
  language: z.enum(OFFER_LANGUAGES), currency: z.enum(OFFER_CURRENCIES), price_list: z.enum(['A','B','C','Reseller']),
  company_entity: z.enum(['climatel','unita1','wise']), vat_regime: z.enum(['standard','reverse_charge','intra_ue','extra_ue','forfetario']),
  payment_method: z.enum(['bonifico','contrassegno']), payment_agreement: Text,
  include_certification: z.boolean(), include_warranty: z.boolean(), warranty_years: z.number().int().min(1).max(10),
  inclusions: Text, exclusions: Text, timeline_produzione: Text, timeline_consegna: Text, timeline_installazione: Text, timeline_collaudo: Text,
};
export const SettingsSchema = z.object({ ...Configuration, validity_days: z.number().int().min(1).max(365),
  signature_name: z.string().max(200), signature_role: z.string().max(200), logo_url: z.string().url().max(2048).refine(value => value.startsWith('https://')),
  companies: z.object({ climatel: Company, unita1: Company, wise: Company }),
  exclusion_presets: z.array(z.object({ label: z.string().max(200), text: Text })).max(20).optional(),
});
export const DocumentSchema = z.object({ ...Configuration,
  customer_name: z.string().trim().min(1).max(300), customer_contact: z.string().max(200),
  customer_email: z.union([z.literal(''),z.string().email().max(300)]), customer_phone: z.string().max(50),
  customer_address: z.string().max(1000), customer_vat: z.string().max(80), title: z.string().trim().min(1).max(300), description: Text,
  valid_until: z.union([z.literal(''),z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const date = new Date(`${value}T00:00:00Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
  })]),
  items: z.array(z.object({ id: z.string().uuid(), product_id: z.string().max(300).nullable(), product_name: z.string().trim().min(1).max(300),
    description: Text, image_url: Url, quantity: z.number().positive().max(100000), unit_price: z.number().min(0).max(10000000),
    discount_percent: z.number().min(0).max(100), notes: Text,
  })).min(1).max(100),
});
export const BodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('save'), id: z.string().uuid(), lead_id: z.string().uuid().nullable(), document: DocumentSchema, status: z.enum(['richiesta_offerta','offerta_pronta','offerta_inviata','negoziazione','offerta_accettata','offerta_rifiutata']), expected_updated_at: z.string().datetime({ offset: true }).optional() }),
  z.object({ action: z.literal('settings') }),
  z.object({ action: z.literal('translate'), document: DocumentSchema, source_language: z.enum(OFFER_LANGUAGES), target_language: z.enum(OFFER_LANGUAGES) }),
  z.object({ action: z.literal('save_settings'), settings: SettingsSchema }),
  z.object({ action: z.literal('share'), id: z.string().uuid(), enabled: z.boolean(), expected_updated_at: z.string().datetime({ offset: true }) }),
  z.object({ action: z.literal('archive'), id: z.string().uuid(), archived: z.boolean(), expected_updated_at: z.string().datetime({ offset: true }) }),
]);