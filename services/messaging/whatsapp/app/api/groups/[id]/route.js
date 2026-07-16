import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Name is required" }, { status: 400 });
  const r = await db
    .prepare("UPDATE groups SET name = ? WHERE id = ? AND business_id = ?")
    .run(name.trim(), id, user.business_id);
  if (!r.changes) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.prepare("DELETE FROM groups WHERE id = ? AND business_id = ?").run(id, user.business_id);
  return Response.json({ ok: true });
}
