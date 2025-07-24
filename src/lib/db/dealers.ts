import { getDb } from "@/lib/db/mongodb";
import { DealerDbSchema } from "@/lib/schemas/dealer.schemas";

export async function createDealer(dealerData: any) {
  const db = await getDb();
  const dealers = db.collection("dealers");

  const existing = await dealers.findOne({ dealerId: dealerData.dealerId });
  if (existing) {
    throw new Error("Dealer already exists");
  }

  const newDealer = DealerDbSchema.parse({
    ...dealerData,
    createdAt: new Date(),
  });

  const result = await dealers.insertOne(newDealer);
  return { ...newDealer, _id: result.insertedId };
}

export async function findDealerById(dealerId: string) {
  const db = await getDb();
  const dealers = db.collection("dealers");
  return dealers.findOne({ dealerId });
}

export async function findAllDealers() {
  const db = await getDb();
  const dealers = db.collection("dealers");
  return dealers.find({}).toArray();
}
