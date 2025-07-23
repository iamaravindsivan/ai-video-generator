import { getDb } from "@/lib/db/mongodb";
import { UserDbSchema } from "@/lib/schemas/user.schemas";
import { USER_ROLES } from "@/lib/constants";
import { ObjectId } from "mongodb";
import type { CreateUserData, UpdateAccountData } from "@/types/user.types";

export async function findUserByEmail(email: string) {
  const db = await getDb();
  const users = db.collection("users");
  return users.findOne({ email });
}

export async function createUser(userData: CreateUserData) {
  const db = await getDb();
  const users = db.collection("users");

  const existing = await users.findOne({ email: userData.email });
  if (existing) {
    throw new Error("User already exists");
  }

  // First user becomes super admin
  const userCount = await users.countDocuments();
  const roles =
    userCount === 0
      ? [USER_ROLES.SUPER_ADMIN]
      : userData.roles || [USER_ROLES.USER];

  const newUser = UserDbSchema.parse({
    ...userData,
    roles,
    createdAt: new Date(),
  });

  const result = await users.insertOne(newUser);
  return { ...newUser, _id: result.insertedId };
}

export async function getUserById(userId: string) {
  const db = await getDb();
  const users = db.collection("users");

  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUser(userId: string, updates: UpdateAccountData) {
  const db = await getDb();
  const users = db.collection("users");

  if (updates.fullName === undefined) {
    throw new Error("No valid fields to update");
  }

  const updateData: any = { fullName: updates.fullName, updatedAt: new Date() };

  const result = await users.updateOne(
    { _id: new ObjectId(userId) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    throw new Error("User not found");
  }

  return getUserById(userId);
}
