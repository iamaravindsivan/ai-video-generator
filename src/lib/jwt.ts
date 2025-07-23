import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET } from './env';
import { addDays } from 'date-fns';

const secret = new TextEncoder().encode(JWT_SECRET);

export async function signJwt(payload: Record<string, any>, expiresInDays = 7): Promise<string> {
  const expirationDate = addDays(new Date(), expiresInDays);
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expirationDate.getTime() / 1000))
    .sign(secret);
}

export async function verifyJwt(token: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    console.error('JWT verification error:', e);
    return null;
  }
} 