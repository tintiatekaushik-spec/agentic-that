// Wipes and recreates demo data. Safe to re-run any time.
//   npm run seed
// Works against whichever DB_CONNECTOR is active (sqlite or postgres).
import db from "../lib/db.js";
import { hashPassword } from "../lib/password.js";

console.log("Seeding Tinitiate AI Services demo data…");

const run = (sql, ...params) => db.prepare(sql).run(...params);
const insertId = async (sql, ...params) =>
  (await db.prepare(`${sql} RETURNING id`).get(...params)).id;

async function seed() {
  // Wipe (order respects FKs). TRUNCATE-equivalent via DELETE works on both.
  for (const t of [
    "messages", "group_members", "groups",
    "templates", "contacts", "sessions", "users", "businesses",
  ]) {
    await run(`DELETE FROM ${t}`);
  }

  const businessId = await insertId(
    "INSERT INTO businesses (name, admin_number, provider, currency) VALUES (?, ?, ?, ?)",
    "Tinitiate AI Services",
    "+919800000000",
    process.env.WA_PROVIDER || "mock",
    "INR"
  );

  await run(
    "INSERT INTO users (business_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')",
    businessId,
    "Demo Admin",
    "admin@demo.test",
    hashPassword("password")
  );

  const contacts = [];
  for (const [name, phone, tags] of [
    ["Arjun Mehta", "+919811111111", "lead,whatsapp-workflow"],
    ["Priya Ventures", "+919822222222", "lead,website"],
    ["Ravi Logistics", "+919833333333", "client,automation"],
    ["Sneha Retail", "+919844444444", "lead,crm"],
    ["NovaTech Pvt", "+919855555555", "client,whatsapp-workflow"],
  ]) {
    contacts.push(
      await insertId(
        "INSERT INTO contacts (business_id, name, phone, tags) VALUES (?, ?, ?, ?)",
        businessId,
        name,
        phone,
        tags
      )
    );
  }

  const templates = [
    ["Welcome — AI Services", "welcome",
      "Hi {{name}}! 👋 I'm from {{business}}.\n\nWe help businesses automate their customer communication on WhatsApp — from booking flows to payment alerts.\n\nReply anytime and I'll walk you through what's possible for your business."],
    ["Share service overview", "marketing",
      "Hi {{name}}, here's a quick overview of what {{business}} can do for you.\n\nLet me know which one fits your needs — happy to do a free consultation!"],
    ["Follow-up — no response", "utility",
      "Hi {{name}}, just checking in from {{business}}. Did you get a chance to look at our WhatsApp automation services? I'd love to understand your use case and see how we can help. 🚀"],
    ["Cold call follow-up", "utility",
      "Hi {{name}}, it was great speaking with you! As discussed, {{business}} can help you automate your customer queries and follow-ups on WhatsApp.\n\nReply to get started or ask any questions."],
  ];
  for (const [name, category, body] of templates) {
    await run(
      "INSERT INTO templates (business_id, name, category, body) VALUES (?, ?, ?, ?)",
      businessId, name, category, body
    );
  }

  // Demo chat on contact 1 (Arjun Mehta)
  await run(
    "INSERT INTO messages (business_id, contact_id, direction, body, template_name, status) VALUES (?, ?, 'out', ?, 'Welcome — AI Services', 'delivered')",
    businessId, contacts[0],
    "Hi Arjun! 👋 I'm from Tinitiate AI Services.\n\nWe help businesses automate their customer communication on WhatsApp — from booking flows to payment alerts.\n\nReply anytime and I'll walk you through what's possible for your business."
  );
  await run(
    "INSERT INTO messages (business_id, contact_id, direction, body, status) VALUES (?, ?, 'in', ?, 'delivered')",
    businessId, contacts[0],
    "Looks interesting! We currently manage orders over WhatsApp manually. What can you automate for us?"
  );
  await run(
    "INSERT INTO messages (business_id, contact_id, direction, body, status) VALUES (?, ?, 'out', ?, 'sent')",
    businessId, contacts[0],
    "Great question! We can automate: order placement, payment reminders, dispatch notifications, and a 24/7 FAQ bot — all without your team lifting a finger. Want to see a quick demo?"
  );
  await run("UPDATE contacts SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?", contacts[0]);

  // Demo chat on contact 2 (Priya Ventures)
  await run(
    "INSERT INTO messages (business_id, contact_id, direction, body, template_name, status) VALUES (?, ?, 'out', ?, 'Welcome — AI Services', 'delivered')",
    businessId, contacts[1],
    "Hi Priya Ventures! 👋 I'm from Tinitiate AI Services.\n\nWe help businesses automate their customer communication on WhatsApp. Reply anytime!"
  );
  await run("UPDATE contacts SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?", contacts[1]);
  await run("UPDATE contacts SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?", contacts[2]);

  const groupLeads = await insertId("INSERT INTO groups (business_id, name) VALUES (?, ?)", businessId, "New Leads — June 2026");
  const groupClients = await insertId("INSERT INTO groups (business_id, name) VALUES (?, ?)", businessId, "Active Clients");
  const groupWebsite = await insertId("INSERT INTO groups (business_id, name) VALUES (?, ?)", businessId, "Website Interest");

  const addMember = (gid, cid) =>
    run("INSERT INTO group_members (group_id, contact_id) VALUES (?, ?) ON CONFLICT DO NOTHING", gid, cid);
  for (const cid of [contacts[0], contacts[1], contacts[3]]) await addMember(groupLeads, cid);
  for (const cid of [contacts[2], contacts[4]]) await addMember(groupClients, cid);
  for (const cid of [contacts[1], contacts[3]]) await addMember(groupWebsite, cid);
}

seed()
  .then(() => {
    console.log("✓ Done. Log in with admin@demo.test / password");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
