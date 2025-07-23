import { NextRequest, NextResponse } from 'next/server';
import { VerifyMagicLinkSchema } from '@/lib/schemas/auth.schemas';
import { verifyMagicLink } from '@/lib/db/magic-links';
import { findUserByEmail } from '@/lib/db/users';
import { signJwt } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { NODE_ENV } from '@/lib/env';
import { addDays } from 'date-fns';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = VerifyMagicLinkSchema.parse(body);
    const email = await verifyMagicLink(token);
    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired magic link' }, { status: 401 });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please sign up first.' }, { status: 404 });
    }
    const jwtToken = await signJwt({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    });
    
    const cookieStore = await cookies();
    const expirationDate = addDays(new Date(), 30);
    const maxAgeInSeconds = Math.floor((expirationDate.getTime() - Date.now()) / 1000);
    
    cookieStore.set('token', jwtToken, {
      httpOnly: true,
      path: '/',
      maxAge: maxAgeInSeconds,
      sameSite: 'lax',
      secure: NODE_ENV === 'production',
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
} 