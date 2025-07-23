import { getDb } from "@/lib/db/mongodb";
import { OTPDbSchema } from "@/lib/schemas/auth.schemas";
import { AUTH_CONFIG } from "@/lib/constants";
import { addMinutes, isAfter } from "date-fns";

export async function createOTP(
  email: string,
  otp: string,
  expiresInMinutes = AUTH_CONFIG.OTP_EXPIRY_MINUTES
) {
  const db = await getDb();
  const otps = db.collection("otps");

  const now = new Date();
  const expiresAt = addMinutes(now, expiresInMinutes);

  const doc = OTPDbSchema.parse({
    email,
    otp,
    expiresAt,
    createdAt: now,
    used: false,
  });

  await otps.insertOne(doc);
}

export async function verifyOTP(email: string, otp: string) {
  const db = await getDb();
  const otps = db.collection("otps");

  const doc = await otps.findOne(
    { email, otp, used: false },
    { sort: { createdAt: -1 } }
  );
  if (!doc) return false;

  const now = new Date();
  if (isAfter(now, new Date(doc.expiresAt))) return false;

  await otps.updateOne({ _id: doc._id }, { $set: { used: true } });
  return true;
}