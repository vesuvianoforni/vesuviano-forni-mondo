import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { metaDeliveryId, metaEventOf, metaSignatureOk, sha256Hex } from "@/lib/whatsappWebhookMeta";

// The receiver accepts Meta-direct deliveries only when the body carries a valid
// X-Hub-Signature-256 HMAC of the raw body with the app secret.
const SECRET = "test-app-secret";

const sign = (body: string, secret = SECRET) => `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

const messagePayload = JSON.stringify({
  object: "whatsapp_business_account",
  entry: [{ changes: [{ field: "messages", value: { messages: [{ id: "wamid.X", from: "393383156161" }] } }] }],
});

describe("Meta direct WhatsApp webhook", () => {
  it("accepts a body signed with the app secret", async () => {
    expect(await metaSignatureOk(messagePayload, sign(messagePayload), SECRET)).toBe(true);
  });

  it("rejects a body that was changed after signing", async () => {
    const header = sign(messagePayload);
    const tampered = messagePayload.replace("393383156161", "390000000000");
    expect(await metaSignatureOk(tampered, header, SECRET)).toBe(false);
  });

  it("rejects a signature made with another secret", async () => {
    expect(await metaSignatureOk(messagePayload, sign(messagePayload, "wrong-secret"), SECRET)).toBe(false);
  });

  it("names inbound messages and delivery statuses the way the connector does", () => {
    expect(metaEventOf(JSON.parse(messagePayload))).toBe("whatsapp.message");
    expect(
      metaEventOf({ entry: [{ changes: [{ field: "messages", value: { statuses: [{ id: "wamid.Y", status: "delivered" }] } }] }] }),
    ).toBe("whatsapp.status");
    expect(metaEventOf({ entry: [{ changes: [{ field: "message_template_status_update", value: {} }] }] })).toBe(
      "whatsapp.template_status",
    );
    expect(metaEventOf({ entry: [{ changes: [{ field: "account_update", value: {} }] }] })).toBe("whatsapp.account_update");
  });

  it("keeps unknown change types stored instead of dropping them", () => {
    expect(metaEventOf({ entry: [{ changes: [{ field: "something_new", value: {} }] }] })).toBe("whatsapp.something_new");
    expect(metaEventOf({ entry: [{ changes: [] }] })).toBeNull();
  });

  it("gives the same delivery id to a retried body and a different one to another body", async () => {
    const a = metaDeliveryId(await sha256Hex(messagePayload));
    expect(a).toBe(metaDeliveryId(await sha256Hex(messagePayload)));
    expect(a).not.toBe(metaDeliveryId(await sha256Hex(messagePayload.replace("wamid.X", "wamid.Z"))));
    expect(a.startsWith("meta-")).toBe(true);
  });
});
