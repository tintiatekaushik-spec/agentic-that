import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { name, phone, tags, notes, opted_in } = await req.json();
  const existing = await db
    .prepare("SELECT * FROM contacts WHERE id = ? AND business_id = ?")
    .get(id, user.business_id);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await db.prepare(
    `UPDATE contacts SET name = ?, phone = ?, tags = ?, notes = ?, opted_in = ?
      WHERE id = ? AND business_id = ?`
  ).run(
    name?.trim() ?? existing.name,
    phone?.trim() ?? existing.phone,
    tags?.trim() ?? existing.tags,
    notes?.trim() ?? existing.notes,
    opted_in == null ? existing.opted_in : opted_in ? 1 : 0,
    id,
    user.business_id
  );
  return Response.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.prepare("DELETE FROM contacts WHERE id = ? AND business_id = ?").run(id, user.business_id);
  return Response.json({ ok: true });
}
