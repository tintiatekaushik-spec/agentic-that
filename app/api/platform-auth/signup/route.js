import {
  platformSessionCookieHeader,
  PlatformAuthError,
  registerPlatformUser,
} from "@platform/server/auth-store";

export async function POST(request) {
  try {
    const registration = await request.json();
    const { token, user } = await registerPlatformUser(registration);
    const response = Response.json({ ok: true, user });
    response.headers.append("Set-Cookie", platformSessionCookieHeader(token));
    return response;
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      const status = error.code === "ACCOUNT_EXISTS" ? 409 : 400;
      return Response.json({ error: error.message }, { status });
    }
    console.error("Platform signup failed", error);
    return Response.json({ error: "Account creation failed. Please try again." }, { status: 500 });
  }
}
