import { getDb } from '@/lib/db/mongodb';
import { AUTH_CONFIG } from '@/lib/constants';
import { subDays } from 'date-fns';

export async function cleanupExpiredOTPs(olderThanDays = AUTH_CONFIG.TOKEN_CLEANUP_DAYS) {
  const db = await getDb();
  const otps = db.collection('otps');
  const cutoffDate = subDays(new Date(), olderThanDays);
  
  const result = await otps.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { createdAt: { $lt: cutoffDate } }
    ]
  });
  
  return result.deletedCount;
}

export async function cleanupExpiredMagicLinks(olderThanDays = AUTH_CONFIG.TOKEN_CLEANUP_DAYS) {
  const db = await getDb();
  const links = db.collection('magiclinks');
  const cutoffDate = subDays(new Date(), olderThanDays);
  
  const result = await links.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { createdAt: { $lt: cutoffDate } }
    ]
  });
  
  return result.deletedCount;
}

export async function cleanupExpiredTokens(olderThanDays = AUTH_CONFIG.TOKEN_CLEANUP_DAYS) {
  const otpCount = await cleanupExpiredOTPs(olderThanDays);
  const linkCount = await cleanupExpiredMagicLinks(olderThanDays);
  
  return {
    otpsDeleted: otpCount,
    magicLinksDeleted: linkCount,
    totalDeleted: otpCount + linkCount
  };
} 