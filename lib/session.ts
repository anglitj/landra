import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const key = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-key"
);

interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
  expiresAt: string;
}

export async function encrypt(payload: Omit<SessionPayload, keyof JWTPayload>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function createSession(
  userId: string,
  email: string,
  name: string
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({
    userId,
    email,
    name,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  if (!parsed) return;

  // Refresh the session
  const refreshed = await encrypt({
    ...parsed,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const response = new Response(null, {
    status: 200,
    headers: {
      "Set-Cookie": `session=${refreshed}; Path=/; HttpOnly; SameSite=Lax; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      } Max-Age=${24 * 60 * 60}`,
    },
  });

  return response;
}
