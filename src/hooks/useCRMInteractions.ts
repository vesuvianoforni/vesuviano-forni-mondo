import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { latestInteractions, type LeadIdentity, type LeadInteraction } from "@/lib/crmActivity";

type InteractionTable = "website_leads" | "chat_conversations" | "email_history" | "configurator_sessions";

async function readAll<T extends InteractionTable>(table: T, columns: string) {
  const rows: Database["public"]["Tables"][T]["Row"][] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(columns).order("id").range(from, from + 999);
    if (error) throw error;
    const batch = (data ?? []) as unknown as Database["public"]["Tables"][T]["Row"][];
    rows.push(...batch);
    if (batch.length < 1000) return rows;
  }
}

export function useCRMInteractions(leads: LeadIdentity[]) {
  const [events, setEvents] = useState<LeadInteraction[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "partial">("loading");
  useEffect(() => {
    let active = true;
    async function load() {
      const results = await Promise.allSettled([
        readAll("website_leads", "id,email,phone,created_at"),
        readAll("chat_conversations", "id,lead_id,visitor_email,visitor_phone,last_message_at,message_count"),
        readAll("email_history", "id,sent_to,sent_at,email_type"),
        readAll("configurator_sessions", "id,customer_email,customer_phone,last_opened_at,feedback_date,customer_actions"),
      ]);
      const collected: LeadInteraction[] = [];
      const [forms, chats, emails, sessions] = results;
      if (forms.status === "fulfilled") for (const row of forms.value) {
        collected.push({ kind: "form", at: row.created_at, email: row.email, phone: row.phone, websiteLeadId: row.id });
      }
      if (chats.status === "fulfilled") for (const row of chats.value) {
        if (row.message_count > 0) collected.push({ kind: "chat", at: row.last_message_at, email: row.visitor_email, phone: row.visitor_phone, websiteLeadId: row.lead_id });
      }
      if (emails.status === "fulfilled") for (const row of emails.value) {
        // Renewal processing is an internal audit event, not a customer email.
        if (row.email_type !== "renewal_processed") collected.push({ kind: "email", at: row.sent_at, email: row.sent_to });
      }
      if (sessions.status === "fulfilled") for (const row of sessions.value) {
        const identity = { email: row.customer_email, phone: row.customer_phone };
        if (row.last_opened_at) collected.push({ ...identity, kind: "configurator", at: row.last_opened_at });
        if (row.feedback_date) collected.push({ ...identity, kind: "feedback", at: row.feedback_date });
        // Only customer events count; admin token renewals and record edits do not.
        const customerEvents = new Set(["model_selected", "fuel_selected", "size_selected", "coating_selected", "quote_saved", "color_render_generated", "architect_ai_used", "payment_initiated", "contact_requested"]);
        if (Array.isArray(row.customer_actions)) for (const action of row.customer_actions) {
          if (action && typeof action === "object" && !Array.isArray(action)
            && typeof action.type === "string" && customerEvents.has(action.type) && typeof action.timestamp === "string") {
            collected.push({ ...identity, kind: "configurator", at: action.timestamp });
          }
        }
      }
      if (active) {
        setEvents(collected);
        setState(results.some(result => result.status === "rejected") ? "partial" : "ready");
      }
    }
    void load();
    return () => { active = false; };
  }, []);
  return { interactions: useMemo(() => latestInteractions(leads, events), [leads, events]), state };
}