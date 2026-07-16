import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { normalizeWaNumber } from "@/lib/wa/provider";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone, tags, notes } = await req.json();
  const cleanPhone = phone?.trim();
  if (!cleanPhone) {
    return Response.json({ error: "Phone is required" }, { status: 400 });
  }

  const normalized = normalizeWaNumber(cleanPhone);
  const rows = await db
    .prepare("SELECT id, phone FROM contacts WHERE business_id = ?")
    .all(user.business_id);
  const existing = rows.find((contact) => normalizeWaNumber(contact.phone) === normalized);
  if (existing) {
    return Response.json({ ok: true, id: existing.id, existing: true });
  }

  try {
    const row = await db
      .prepare(
        "INSERT INTO contacts (business_id, name, phone, tags, notes) VALUES (?, ?, ?, ?, ?) RETURNING id"
      )
      .get(
        user.business_id,
        name?.trim() || cleanPhone,
        cleanPhone,
        tags?.trim() || null,
        notes?.trim() || null
      );
    return Response.json({ ok: true, id: row.id });
  } catch (err) {
    if (/UNIQUE|duplicate key/i.test(String(err.message))) {
      return Response.json({ error: "A contact with this phone already exists" }, { status: 409 });
    }
    throw err;
  }
}
