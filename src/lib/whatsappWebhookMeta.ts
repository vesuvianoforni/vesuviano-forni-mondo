// Meta-native WhatsApp webhook helpers, used by the site receiver so Meta can deliver straight
// to this app (Netlify) without going through the Lovable connector gateway.
// Everything fails closed: without the app secret nothing is ever accepted.

export const MAX_BODY_BYTES = 4 * 1024 * 1024;

async function hex(bytes: ArrayBuffer): Promise<string> {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(text: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

// Meta signs the raw body with the app secret: `X-Hub-Signature-256: sha256=<hex hmac>`.
export async function metaSignatureOk(body: string, header: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = `sha256=${await hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))}`;
  if (expected.length !== header.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ header.charCodeAt(i);
  return diff === 0;
}

// Meta keeps the delivery id-less, so the receiver names the event the same way the connector does.
export function metaEventOf(payload: any): string | null {
  const change = payload?.entry?.[0]?.changes?.[0];
  const field = String(change?.field ?? "");
  if (!field) return null;
  if (field === "message_template_status_update") return "whatsapp.template_status";
  if (field === "account_update") return "whatsapp.account_update";
  const value = change?.value;
  if (field === "messages" && value) return value.messages?.length ? "whatsapp.message" : "whatsapp.status";
  return `whatsapp.${field}`;
}

// Meta retries the identical body, so hashing it gives a stable id for deduplication.
export function metaDeliveryId(bodyHash: string): string {
  return `meta-${bodyHash}`;
}
