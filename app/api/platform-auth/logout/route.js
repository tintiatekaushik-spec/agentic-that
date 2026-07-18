import { cookies } from "next/headers";
import {
  clearPlatformSessionCookieHeader,
  destroyPlatformSession,
  PLATFORM_SESSION_COOKIE,
} from "@platform/server/auth-store";

export async function POST() {
  const cookieStore = await cookies();
  await destroyPlatformSession(cookieStore.get(PLATFORM_SESSION_COOKIE)?.value);
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", clearPlatformSessionCookieHeader());
  return response;
}
