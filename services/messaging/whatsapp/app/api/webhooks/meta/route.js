import db from "@/lib/db";
import { recordInbound } from "@/lib/wa/messaging";
import { normalizeWaNumber } from "@/lib/wa/provider";

// Meta WhatsApp Cloud API posts events here. Configure in Meta for Developers >
// WhatsApp > Configuration > Webhook:
//   Callback URL:  https://<your-host>/api/webhooks/meta
//   Verify token:  the value of META_WEBHOOK_VERIFY_TOKEN
// Subscribe to the "messages" field.
//
// Meta first calls GET to verify the callback (hub.challenge handshake), then
// POSTs the WhatsApp Business Account payload for every event afterwards.

export function GET(req) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && expected && token === expected) {
    return new Response(challenge, { status: 200 });
  }
  return Response.json({ error: "forbidden" }, { status: 403 });
}

export async function POST(req) {
  const payload = await req.json().catch(() => null);
  if (!payload) return Response.json({ ok: true }); // ack malformed pings

  const business = await db.prepare("SELECT * FROM businesses ORDER BY id LIMIT 1").get();
  if (!business) return Response.json({ ok: true });

  const changes = payload.entry?.flatMap((e) => e.changes || []) || [];
  for (const change of changes) {
    const value = change.value || {};
    const messages = value.messages || [];
    if (!messages.length) continue; // status callbacks (sent/delivered/read) — nothing to record

    // Which of the business's sender numbers received this message — kept on
    // every row so replies can go out from the same number.
    const phoneNumberId = value.metadata?.phone_number_id || null;

    for (const msg of messages) {
      const waId = normalizeWaNumber(msg.from || "");
      if (!waId) continue;

      const contactRows = await db
        .prepare("SELECT * FROM contacts WHERE business_id = ?")
        .all(business.id);
      let contact = contactRows.find((c) => normalizeWaNumber(c.phone) === waId);

      const profileName = value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name;

      if (!contact) {
        const name = profileName || `+${waId}`;
        contact = await db
          .prepare("INSERT INTO contacts (business_id, name, phone) VALUES (?, ?, ?) RETURNING *")
          .get(business.id, name, `+${waId}`);
      } else if (profileName && normalizeWaNumber(contact.name) === waId) {
        // Contact was created before we knew their name (e.g. via Quick Send,
        // name defaulted to their phone number) — backfill it now that
        // WhatsApp has told us their real profile name.
        await db.prepare("UPDATE contacts SET name = ? WHERE id = ?").run(profileName, contact.id);
        contact = { ...contact, name: profileName };
      }

      // Interactive button/list taps carry their label in msg.interactive.*;
      // legacy quick-reply buttons carry it in msg.button.text.
      const buttonText =
        msg.interactive?.button_reply?.title ||
        msg.interactive?.list_reply?.title ||
        msg.button?.text ||
        null;

      const body = buttonText || msg.text?.body || `(unsupported message: ${msg.type})`;

      await recordInbound({
        business,
        contact,
        body,
        providerId: msg.id || null,
        buttonReply: Boolean(buttonText),
        phoneNumberId,
      });
    }
  }

  return Response.json({ ok: true });
}
