import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest } from "@lovable.dev/webhooks-js";
import { MAX_BODY_BYTES, metaDeliveryId, metaEventOf, metaSignatureOk, sha256Hex } from "@/lib/whatsappWebhookMeta";

// WhatsApp receiver for Bruno's UK line. Two delivery routes, both verified and both stored in
// whatsapp_webhook_events before anything is processed:
//   1. Lovable connector gateway  -> signed with WHATSAPP_API_KEY, X-Lovable-Delivery/X-Lovable-Event headers.
//   2. Meta direct                -> signed with the Meta app secret (X-Hub-Signature-256), so the
//      receiver also works on the Netlify-hosted site without publishing on Lovable.
// Stored rows are handed to the bruno-whatsapp-inbound edge function, which deduplicates messages by
// wamid into crm_messages and applies delivery statuses. Failed rows stay pending and are retried
// (bounded) on later deliveries. The database trigger on crm_messages sends the Telegram alert.

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

async function processRow(admin: Admin, row: { id: string; event: string; payload: any; attempts: number }) {
  const value = row.payload?.entry?.[0]?.changes?.[0]?.value;
  let error: string | null = null;
  if (value && (row.event === "whatsapp.message" || row.event === "whatsapp.status")) {
    try {
      if (row.event === 'whatsapp.status' && String(value.metadata?.phone_number_id) === '1487643001088299') {
        for (const status of (value.statuses ?? []).slice(0, 100)) {
          if (!status.id) continue;
          const result = await admin.rpc('reconcile_bruno_uk_status', { p_external_id: String(status.id) });
          if (result.error) throw result.error;
          // No matching outbound yet is safe: the sender replays stored statuses after reserving its id.
        }
      } else {
        const res = await fetch(`${process.env["SUPABASE_URL"]}/functions/v1/bruno-whatsapp-inbound`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-internal-key": process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "", "x-api-key": process.env["ZAPPER_SYNC_KEY"] ?? "" },
          body: JSON.stringify({ value }),
          signal: AbortSignal.timeout(1800),
        });
        const text = await res.text();
        if (!res.ok || text.includes('"error"')) error = `[${res.status}] ${text.slice(0, 500)}`;
      }
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

// Durable receipt first: the row must exist before any processing, and a duplicate delivery reuses it.
async function storeAndProcess(admin: Admin, deliveryId: string, event: string, payload: unknown, startedAt: number) {
  const { error: insErr } = await admin
    .from("whatsapp_webhook_events")
    .upsert({ delivery_id: deliveryId, event, payload: payload as any }, { onConflict: "delivery_id", ignoreDuplicates: true });
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
  for (const r of due ?? []) {
    if (Date.now() - startedAt > 2200) break;
    await processRow(admin, r as any).catch(() => {});
  }

  return ok ? new Response("ok") : new Response("Processing failed", { status: 500 });
}

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      // Meta's one-time subscription check: answer with the challenge only when the token matches.
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = process.env["META_WHATSAPP_VERIFY_TOKEN"];
        if (!token) return new Response("Not configured", { status: 500 });
        if (url.searchParams.get("hub.mode") !== "subscribe" || url.searchParams.get("hub.verify_token") !== token) {
          return new Response("Forbidden", { status: 403 });
        }
        const challenge = url.searchParams.get("hub.challenge");
        return challenge ? new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } }) : new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const startedAt = Date.now();
        const gatewayDelivery = request.headers.get("X-Lovable-Delivery")?.trim();
        const signature = request.headers.get("X-Hub-Signature-256")?.trim();
        const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");

        // Route 1 - Lovable connector gateway.
        if (gatewayDelivery) {
          const secret = process.env["WHATSAPP_API_KEY"];
          if (!secret) return new Response("Not configured", { status: 500 });
          let verified;
          try {
            verified = await verifyWebhookRequest({ req: request, secret, maxBodyBytes: MAX_BODY_BYTES });
          } catch {
            return new Response("Invalid signature", { status: 401 });
          }
          const event = request.headers.get("X-Lovable-Event")?.trim();
          if (!event) return new Response("Missing headers", { status: 400 });
          return storeAndProcess(admin, gatewayDelivery, event, verified.payload, startedAt);
        }

        // Route 2 - Meta direct (X-Hub-Signature-256 with the app secret).
        if (signature) {
          const secret = process.env["META_WHATSAPP_APP_SECRET"];
          if (!secret) return new Response("Not configured", { status: 500 });
          const body = await request.text();
          if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) return new Response("Payload too large", { status: 413 });
          if (!(await metaSignatureOk(body, signature, secret))) return new Response("Invalid signature", { status: 401 });
          let payload: unknown;
          try {
            payload = JSON.parse(body);
          } catch {
            return new Response("Invalid JSON", { status: 400 });
          }
          const event = metaEventOf(payload);
          if (!event) return new Response("Unsupported payload", { status: 400 });
          return storeAndProcess(admin, metaDeliveryId(await sha256Hex(body)), event, payload, startedAt);
        }

        return new Response("Missing headers", { status: 400 });
      },
    },
  },
});
