import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest } from "@lovable.dev/webhooks-js";

// Lovable WhatsApp connector receiver (UK line). Every verified delivery is stored in
// whatsapp_webhook_events first, then handed to the bruno-whatsapp-inbound edge function,
// which deduplicates messages by wamid into crm_messages and applies delivery statuses.
// Failed rows stay pending and are retried (bounded) on later deliveries.

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

async function processRow(admin: Admin, row: { id: string; event: string; payload: any; attempts: number }) {
  const value = row.payload?.entry?.[0]?.changes?.[0]?.value;
  let error: string | null = null;
  if (value && (row.event === "whatsapp.message" || row.event === "whatsapp.status")) {
    try {
      const res = await fetch(`${process.env["SUPABASE_URL"]}/functions/v1/bruno-whatsapp-inbound`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-key": process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "" },
        body: JSON.stringify({ value }),
      });
      const text = await res.text();
      if (!res.ok || text.includes('"error"')) error = `[${res.status}] ${text.slice(0, 500)}`;
    } catch (e) {
      error = String((e as Error).message ?? e);
    }
  }
  const attempts = row.attempts + 1;
  const { error: upd } = await admin
    .from("whatsapp_webhook_events")
    .update(
      error
        ? { processing_error: error, attempts, next_attempt_at: new Date(Date.now() + Math.min(3600, 30 * 2 ** attempts) * 1000).toISOString() }
        : { processed_at: new Date().toISOString(), processing_error: null, attempts },
    )
    .eq("id", row.id);
  if (upd) throw new Error(upd.message);
  return !error;
}

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["WHATSAPP_API_KEY"];
        if (!secret) return new Response("Not configured", { status: 500 });
        let verified;
        try {
          verified = await verifyWebhookRequest({ req: request, secret, maxBodyBytes: 4 * 1024 * 1024 });
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }
        const deliveryId = request.headers.get("X-Lovable-Delivery")?.trim();
        const event = request.headers.get("X-Lovable-Event")?.trim();
        if (!deliveryId || !event) return new Response("Missing headers", { status: 400 });

        const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
        const { error: insErr } = await admin
          .from("whatsapp_webhook_events")
          .upsert({ delivery_id: deliveryId, event, payload: verified.payload as any }, { onConflict: "delivery_id", ignoreDuplicates: true });
        if (insErr) return new Response("Storage failed", { status: 500 });

        const { data: row, error: selErr } = await admin
          .from("whatsapp_webhook_events")
          .select("id, event, payload, attempts, processed_at")
          .eq("delivery_id", deliveryId)
          .single();
        if (selErr || !row) return new Response("Storage failed", { status: 500 });

        let ok = true;
        if (!row.processed_at) ok = await processRow(admin, row as any);

        // Bounded recovery of earlier pending rows, oldest due first (backoff spreads them out).
        const { data: due } = await admin
          .from("whatsapp_webhook_events")
          .select("id, event, payload, attempts")
          .is("processed_at", null)
          .lte("next_attempt_at", new Date().toISOString())
          .neq("id", row.id)
          .order("next_attempt_at")
          .limit(3);
        for (const r of due ?? []) await processRow(admin, r as any).catch(() => {});

        return ok ? new Response("ok") : new Response("Processing failed", { status: 500 });
      },
    },
  },
});
