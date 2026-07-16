import db from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json();
  const user = await db.prepare("SELECT * FROM users WHERE email = ?").get(String(email || "").trim());
  if (!user || !verifyPassword(password || "", user.password_hash)) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const token = await createSession(user.id);
  await setSessionCookie(token);
  return Response.json({ ok: true });
}
