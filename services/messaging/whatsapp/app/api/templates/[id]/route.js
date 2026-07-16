import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.prepare("DELETE FROM templates WHERE id = ? AND business_id = ?").run(id, user.business_id);
  return Response.json({ ok: true });
}
