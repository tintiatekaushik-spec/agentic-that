import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const groups = await db
    .prepare(
      `SELECT g.*, CAST(COUNT(gm.contact_id) AS INTEGER) AS member_count
         FROM groups g
         LEFT JOIN group_members gm ON gm.group_id = g.id
        WHERE g.business_id = ?
        GROUP BY g.id ORDER BY lower(g.name)`
    )
    .all(user.business_id);
  return Response.json({ groups });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Name is required" }, { status: 400 });
  const row = await db
    .prepare("INSERT INTO groups (business_id, name) VALUES (?, ?) RETURNING id")
    .get(user.business_id, name.trim());
  return Response.json({ ok: true, id: row.id });
}
