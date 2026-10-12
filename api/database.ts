/*
(c) Meher Mankar
See the LICENSE file in the project root.
*/

import {
  MongoClient,
  ObjectId,
} from "https://deno.land/x/mongo@v0.31.2/mod.ts";

import config from "../env.ts";

console.log("Connecting to MongoDB...");
const client = new MongoClient();
const mongoUrl = new URL(config.MONGO_URL);
if (!mongoUrl.searchParams.has("authMechanism")) {
  mongoUrl.searchParams.set("authMechanism", "SCRAM-SHA-1");
}

try {
  await client.connect(mongoUrl.href);
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
  throw error;
}

const db = client.database("SelfShortener");

interface UrlSchema {
  _id: ObjectId;
  hash: string;
  url: string;
}

const urls = db.collection<UrlSchema>("URLS");
await urls.createIndexes({
  indexes: [{ key: { hash: 1 }, name: "hash_unique", unique: true }],
});

function createHash(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    error.code === 11000;
}

export function checkIfUrlExists(url: string) {
  return urls.findOne({ url });
}

export async function shortenUrl(url: string): Promise<string> {
  const existingUrl = await checkIfUrlExists(url);
  if (existingUrl) {
    return existingUrl.hash;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const hash = createHash();
    try {
      await urls.insertOne({ url, hash });
      return hash;
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      const concurrentUrl = await checkIfUrlExists(url);
      if (concurrentUrl) {
        return concurrentUrl.hash;
      }
    }
  }

  throw new Error("Could not allocate a unique short-link hash after 5 attempts.");
}

export async function getUrl(hash: string) {
  return (await urls.findOne({ hash }))?.url;
}
