import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "fleet-calendar-default-secret-key-change-in-production"
);

export const AUTH_COOKIE_NAME = "fleet_session_token";

export interface SessionPayload {
  userId: number;
  username: string;
  name: string;
  role: "USER" | "ADMIN";
}

/**
 * 簽發 JWT Token
 */
export async function signToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * 驗證 JWT Token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * 伺服器端取得目前已登入之使用者資訊
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifyToken(token);
  if (!session) return null;

  // 驗證資料庫使用者是否仍存在
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, name: true, role: true },
  });

  if (!user) return null;

  return {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role as "USER" | "ADMIN",
  };
}
