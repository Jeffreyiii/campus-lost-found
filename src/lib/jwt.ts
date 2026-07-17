import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SECRET_KEY || 'campuslostfound2026abc'
);
const JWT_EXPIRATION = process.env.JWT_EXPIRATION_HOURS || '24';

/** 签发 JWT token */
export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRATION}h`)
    .sign(JWT_SECRET);
}

/** 验证并解析 JWT token，失败返回 null */
export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}
