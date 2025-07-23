import { getDb } from '@/lib/db/mongodb';
import { MagicLinkDbSchema } from '@/lib/schemas/auth.schemas';
import { AUTH_CONFIG } from '@/lib/constants';
import { addMinutes, isAfter } from 'date-fns';

export async function createMagicLink(email: string, token: string, expiresInMinutes = AUTH_CONFIG.MAGIC_LINK_EXPIRY_MINUTES) {
  const db = await getDb();
  const links = db.collection('magiclinks');
  
  const now = new Date();
  const expiresAt = addMinutes(now, expiresInMinutes);
  
  const doc = MagicLinkDbSchema.parse({
    email,
    token,
    expiresAt,
    createdAt: now,
    used: false,
  });
  
  await links.insertOne(doc);
}

export async function verifyMagicLink(token: string) {
  const db = await getDb();
  const links = db.collection('magiclinks');
  
  const doc = await links.findOne({ token, used: false });
  if (!doc) return null;
  
  const now = new Date();
  if (isAfter(now, doc.expiresAt)) return null;
  
  await links.updateOne({ _id: doc._id }, { $set: { used: true } });
  return doc.email;
} 