import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { name, category, body } = await req.json();
  if (!name?.trim() || !body?.trim()) {
    return Response.json({ error: "Name and body are required" }, { status: 400 });
  }
  const row = await db
    .prepare("INSERT INTO templates (business_id, name, category, body) VALUES (?, ?, ?, ?) RETURNING id")
    .get(user.business_id, name.trim(), category?.trim() || "marketing", body.trim());
  return Response.json({ ok: true, id: row.id });
}
