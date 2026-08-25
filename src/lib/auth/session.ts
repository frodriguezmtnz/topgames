import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { randomToken, sha256 } from "./password";
import { APP_URL } from "@/lib/config";

const SESSION_COOKIE = "session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export async function createSession(
  userId: string,
  meta: { userAgent?: string; ip?: string },
): Promise<string> {
  const raw = randomToken(32);
  await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(raw),
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return raw;
}

export async function getSessionUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(raw) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session.user;
}

export async function deleteSession(rawToken?: string) {
  const store = await cookies();
  const raw = rawToken ?? store.get(SESSION_COOKIE)?.value;
  if (raw) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(raw) } });
  }
  store.delete(SESSION_COOKIE);
}

export async function setSessionCookie(rawToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: APP_URL.startsWith("https://"),
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}
