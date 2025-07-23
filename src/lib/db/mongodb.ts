import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI } from '@/lib/env';

const uri = MONGODB_URI;
if (!uri) throw new Error('Please define the MONGODB_URI environment variable');

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

const clientPromise = global._mongoClientPromise!;

export async function getDb(dbName = "xtimate-ai"): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}