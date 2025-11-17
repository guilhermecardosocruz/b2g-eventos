import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "events_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET não configurado nas variáveis de ambiente");
  }
  return secret;
}

function base64UrlEncode(input: Buffer | string): string {
  const buff = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buff
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signPayload(payload: string): string {
  const secret = getSessionSecret();
  const crypto = require("crypto") as typeof import("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const signature = base64UrlEncode(hmac.digest());
  return `${payload}.${signature}`;
}

function verifySignedToken(token: string): { userId: string; issuedAt: number } | null {
  const secret = getSessionSecret();
  const crypto = require("crypto") as typeof import("crypto");

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, issuedAtStr, signature] = parts;
  const payload = `${userId}.${issuedAtStr}`;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = base64UrlEncode(hmac.digest());

  if (signature !== expectedSignature) return null;

  const issuedAt = Number.parseInt(issuedAtStr, 10);
  if (!Number.isFinite(issuedAt)) return null;

  return { userId, issuedAt };
}

export async function createSession(userId: string): Promise<void> {
  const issuedAt = Date.now();
  const payload = `${userId}.${issuedAt}`;
  const token = signPayload(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function getCurrentSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const parsed = verifySignedToken(raw);
  if (!parsed) return null;

  // Se quiser expirar por tempo de emissão, pode validar aqui

  return { userId: parsed.userId };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
