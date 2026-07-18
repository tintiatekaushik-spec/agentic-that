import {
  loginPlatformUser,
  platformSessionCookieHeader,
  PlatformAuthError,
} from "@platform/server/auth-store";

export async function POST(request) {
  try {
    const credentials = await request.json();
    const { token, user } = await loginPlatformUser(credentials);
    const response = Response.json({ ok: true, user });
    response.headers.append("Set-Cookie", platformSessionCookieHeader(token));
    return response;
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    console.error("Platform login failed", error);
    return Response.json({ error: "Sign in failed. Please try again." }, { status: 500 });
  }
}
