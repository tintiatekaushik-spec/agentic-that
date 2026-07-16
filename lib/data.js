import db from "./db.js";
import { normalizeWaNumber } from "./wa/provider.js";

// This deployment serves a single business; helpers resolve it from the
// signed-in user's business_id. All queries are scoped by business_id.
//
// SQL is written portably for both the SQLite and Postgres connectors:
//   - '?' placeholders, case-insensitive ordering via lower(), CAST(... AS
//     INTEGER) on counts (so Postgres doesn't return bigint as a string), and
//     timestamp cutoffs passed as JS Date params (each connector serializes).

export async function getBusiness(businessId) {
  return db.prepare("SELECT * FROM businesses WHERE id = ?").get(businessId);
}

// --- Contacts --------------------------------------------------------------
export async function listContacts(businessId) {
  return db
    .prepare("SELECT * FROM contacts WHERE business_id = ? ORDER BY lower(name)")
    .all(businessId);
}

export async function listContactThreads(businessId) {
  return db
    .prepare(
      `SELECT c.*,
              (SELECT body FROM messages m WHERE m.contact_id = c.id
                ORDER BY m.created_at DESC LIMIT 1) AS last_message,
              (SELECT direction FROM messages m WHERE m.contact_id = c.id
                ORDER BY m.created_at DESC LIMIT 1) AS last_message_direction,
              (SELECT status FROM messages m WHERE m.contact_id = c.id
                ORDER BY m.created_at DESC LIMIT 1) AS last_message_status,
              (SELECT created_at FROM messages m WHERE m.contact_id = c.id
                ORDER BY m.created_at DESC LIMIT 1) AS last_message_at
         FROM contacts c
        WHERE c.business_id = ?
        ORDER BY COALESCE(c.last_activity_at, c.created_at) DESC`
    )
    .all(businessId);
}

export async function getContact(businessId, id) {
  return db
    .prepare("SELECT * FROM contacts WHERE business_id = ? AND id = ?")
    .get(businessId, id);
}

// Set of normalized phone numbers already in the CRM (for de-duping imports).
export async function existingPhoneSet(businessId) {
  const rows = await db.prepare("SELECT phone FROM contacts WHERE business_id = ?").all(businessId);
  return new Set(rows.map((r) => normalizeWaNumber(r.phone)).filter(Boolean));
}

// Insert WATI contacts into the CRM, skipping numbers that already exist.
// Returns { imported, skipped }.
export async function importContacts(businessId, contacts) {
  const have = await existingPhoneSet(businessId);
  let imported = 0;
  let skipped = 0;
  await db.tx(async ({ prepare }) => {
    const insert = prepare(
      "INSERT INTO contacts (business_id, name, phone, tags) VALUES (?, ?, ?, ?)"
    );
    for (const c of contacts) {
      const norm = normalizeWaNumber(c.phone);
      if (!norm || have.has(norm)) {
        skipped++;
        continue;
      }
      const tags = c.source ? `wati,${c.source}` : "wati";
      await insert.run(businessId, c.name || `+${norm}`, c.phone || `+${norm}`, tags);
      have.add(norm);
      imported++;
    }
  });
  return { imported, skipped };
}

// --- Messages (1-1 chat) ---------------------------------------------------
export async function listMessages(contactId) {
  return db
    .prepare("SELECT * FROM messages WHERE contact_id = ? ORDER BY created_at ASC")
    .all(contactId);
}

// For the chat window's polling — only rows newer than the last one it already
// has, so an open chat picks up inbound webhook replies without a full reload.
export async function listMessagesAfter(contactId, afterId) {
  return db
    .prepare("SELECT * FROM messages WHERE contact_id = ? AND id > ? ORDER BY created_at ASC")
    .all(contactId, afterId);
}

// Business-wide version, for the Message center where several chats are on
// screen at once — one poll returns every new message, grouped client-side.
export async function listBusinessMessagesAfter(businessId, afterId) {
  return db
    .prepare("SELECT * FROM messages WHERE business_id = ? AND id > ? ORDER BY id ASC")
    .all(businessId, afterId);
}

// The business sender number this contact last messaged — replies default to
// it so the conversation continues on the same WhatsApp thread (each business
// number is a separate chat on the customer's phone).
export async function lastInboundPhoneId(contactId) {
  const row = await db
    .prepare(
      `SELECT phone_number_id FROM messages
        WHERE contact_id = ? AND direction = 'in' AND phone_number_id IS NOT NULL
        ORDER BY id DESC LIMIT 1`
    )
    .get(contactId);
  return row?.phone_number_id || null;
}

// --- Templates -------------------------------------------------------------
export async function listTemplates(businessId) {
  return db
    .prepare("SELECT * FROM templates WHERE business_id = ? ORDER BY lower(name)")
    .all(businessId);
}

// --- Groups ----------------------------------------------------------------
export async function listGroups(businessId) {
  return db
    .prepare(
      `SELECT g.*,
              CAST(COUNT(gm.contact_id) AS INTEGER) AS member_count
         FROM groups g
         LEFT JOIN group_members gm ON gm.group_id = g.id
        WHERE g.business_id = ?
        GROUP BY g.id
        ORDER BY lower(g.name)`
    )
    .all(businessId);
}

export async function getGroup(businessId, id) {
  return db
    .prepare("SELECT * FROM groups WHERE business_id = ? AND id = ?")
    .get(businessId, id);
}

export async function listGroupMembers(groupId) {
  return db
    .prepare(
      `SELECT c.* FROM contacts c
         JOIN group_members gm ON gm.contact_id = c.id
        WHERE gm.group_id = ?
        ORDER BY lower(c.name)`
    )
    .all(groupId);
}

export async function listContactsNotInGroup(businessId, groupId) {
  return db
    .prepare(
      `SELECT * FROM contacts
        WHERE business_id = ?
          AND id NOT IN (SELECT contact_id FROM group_members WHERE group_id = ?)
        ORDER BY lower(name)`
    )
    .all(businessId, groupId);
}

// --- Eagle Eye dashboard ---------------------------------------------------
// All contacts with their recent-activity summary. `window` is days back
// (e.g. 7 = this week, 15 = last 15 days); 0 = all time.
export async function eagleEye(businessId, windowDays = 0) {
  const contacts = await db
    .prepare(
      `SELECT c.*,
              (SELECT body FROM messages m WHERE m.contact_id = c.id
                ORDER BY m.created_at DESC LIMIT 1) AS last_message
         FROM contacts c
        WHERE c.business_id = ?
        ORDER BY COALESCE(c.last_activity_at, c.created_at) DESC`
    )
    .all(businessId);

  const withinWindow = (value) => {
    if (!windowDays) return true;
    if (!value) return false;
    const t = new Date(String(value).replace(" ", "T") + (String(value).includes("Z") ? "" : "Z")).getTime();
    return Date.now() - t <= windowDays * 86400000;
  };

  return contacts.filter((c) => withinWindow(c.last_activity_at || c.created_at));
}

export async function dashboardStats(businessId) {
  const since = new Date(Date.now() - 7 * 86400000);
  const contacts = await db
    .prepare("SELECT CAST(COUNT(*) AS INTEGER) AS n FROM contacts WHERE business_id = ?")
    .get(businessId);
  const messages7d = await db
    .prepare(
      "SELECT CAST(COUNT(*) AS INTEGER) AS n FROM messages WHERE business_id = ? AND created_at >= ?"
    )
    .get(businessId, since);
  return { contacts: contacts.n, messages7d: messages7d.n };
}

// Contacts who have sent at least one inbound message, most recent reply first.
export async function respondedContacts(businessId) {
  return db
    .prepare(
      `SELECT c.*,
              (SELECT body FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                ORDER BY m.created_at DESC LIMIT 1) AS last_reply,
              (SELECT created_at FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                ORDER BY m.created_at DESC LIMIT 1) AS last_reply_at
         FROM contacts c
        WHERE c.business_id = ?
          AND EXISTS (SELECT 1 FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in')
        ORDER BY last_reply_at DESC`
    )
    .all(businessId);
}

// Contacts who were messaged (outbound) but have never replied.
export async function unrespondedContacts(businessId) {
  return db
    .prepare(
      `SELECT c.*,
              (SELECT body FROM messages m WHERE m.contact_id = c.id AND m.direction = 'out'
                ORDER BY m.created_at DESC LIMIT 1) AS last_outbound,
              (SELECT created_at FROM messages m WHERE m.contact_id = c.id AND m.direction = 'out'
                ORDER BY m.created_at DESC LIMIT 1) AS last_outbound_at
         FROM contacts c
        WHERE c.business_id = ?
          AND EXISTS (SELECT 1 FROM messages m WHERE m.contact_id = c.id AND m.direction = 'out')
          AND NOT EXISTS (SELECT 1 FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in')
        ORDER BY last_outbound_at DESC`
    )
    .all(businessId);
}

// Chats with inbound messages the business user hasn't opened yet — an
// inbound row newer than the contact's last_read_message_id marker.
export async function unreadContacts(businessId) {
  return db
    .prepare(
      `SELECT c.*,
              (SELECT body FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                ORDER BY m.id DESC LIMIT 1) AS last_reply,
              (SELECT created_at FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                ORDER BY m.id DESC LIMIT 1) AS last_reply_at,
              CAST((SELECT COUNT(*) FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                 AND m.id > COALESCE(c.last_read_message_id, 0)) AS INTEGER) AS unread_count
         FROM contacts c
        WHERE c.business_id = ?
          AND EXISTS (SELECT 1 FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                        AND m.id > COALESCE(c.last_read_message_id, 0))
        ORDER BY last_reply_at DESC`
    )
    .all(businessId);
}

// Chats whose replies have all been seen (has inbound, none newer than the marker).
export async function readContacts(businessId) {
  return db
    .prepare(
      `SELECT c.*,
              (SELECT body FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                ORDER BY m.id DESC LIMIT 1) AS last_reply,
              (SELECT created_at FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                ORDER BY m.id DESC LIMIT 1) AS last_reply_at
         FROM contacts c
        WHERE c.business_id = ?
          AND EXISTS (SELECT 1 FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in')
          AND NOT EXISTS (SELECT 1 FROM messages m WHERE m.contact_id = c.id AND m.direction = 'in'
                            AND m.id > COALESCE(c.last_read_message_id, 0))
        ORDER BY last_reply_at DESC`
    )
    .all(businessId);
}

// Advance the read marker to the contact's newest inbound message.
export async function markContactRead(businessId, contactId) {
  await db
    .prepare(
      `UPDATE contacts
          SET last_read_message_id =
                (SELECT COALESCE(MAX(id), 0) FROM messages WHERE contact_id = ? AND direction = 'in')
        WHERE id = ? AND business_id = ?`
    )
    .run(contactId, contactId, businessId);
}

// Outbound delivery + reply status, for the dashboard summary cards.
export async function messageStatusSummary(businessId) {
  const one = async (sql) => (await db.prepare(sql).get(businessId)).n;
  const sent = await one(
    "SELECT CAST(COUNT(*) AS INTEGER) n FROM messages WHERE business_id = ? AND direction = 'out'"
  );
  const delivered = await one(
    "SELECT CAST(COUNT(*) AS INTEGER) n FROM messages WHERE business_id = ? AND direction = 'out' AND status IN ('sent','delivered','read')"
  );
  const failed = await one(
    "SELECT CAST(COUNT(*) AS INTEGER) n FROM messages WHERE business_id = ? AND direction = 'out' AND status = 'failed'"
  );
  const inbound = await one(
    "SELECT CAST(COUNT(*) AS INTEGER) n FROM messages WHERE business_id = ? AND direction = 'in'"
  );
  const contacted = await one(
    "SELECT CAST(COUNT(DISTINCT contact_id) AS INTEGER) n FROM messages WHERE business_id = ? AND direction = 'out'"
  );
  const responded = await one(
    "SELECT CAST(COUNT(DISTINCT contact_id) AS INTEGER) n FROM messages WHERE business_id = ? AND direction = 'in'"
  );
  return {
    sent,
    delivered,
    failed,
    inbound,
    contacted,
    responded,
    responseRate: contacted ? Math.round((responded / contacted) * 100) : 0,
  };
}
