/*
(c) Meher Mankar
See the LICENSE file in the project root.
*/

import { randomBytes } from "node:crypto";
import {
  MongoClient,
  MongoServerError,
  type Collection,
} from "mongodb";

interface UrlRecord {
  hash: string;
  url: string;
}

type MongoRuntime = typeof globalThis & {
  shortlyMongoCollection?: Promise<Collection<UrlRecord>>;
};

const runtime = globalThis as MongoRuntime;

function getUrls(): Promise<Collection<UrlRecord>> {
  if (!runtime.shortlyMongoCollection) {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL must be set in the Vercel environment.");
    }

    const client = new MongoClient(mongoUrl);
    runtime.shortlyMongoCollection = client.connect()
      .then(async () => {
        const urls = client.db("SelfShortener").collection<UrlRecord>("URLS");
        await urls.createIndex(
          { hash: 1 },
          { name: "hash_unique", unique: true },
        );
        return urls;
      })
      .catch((error: unknown) => {
        runtime.shortlyMongoCollection = undefined;
        throw error;
      });
  }

  return runtime.shortlyMongoCollection;
}

function createHash(): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  return Array.from(randomBytes(8), (byte) => alphabet[byte % alphabet.length])
    .join("");
}

export async function shortenUrl(url: string): Promise<string> {
  const urls = await getUrls();
  const existingUrl = await urls.findOne({ url });
  if (existingUrl) {
    return existingUrl.hash;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const hash = createHash();
    try {
      await urls.insertOne({ url, hash });
      return hash;
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) {
        throw error;
      }

      const concurrentUrl = await urls.findOne({ url });
      if (concurrentUrl) {
        return concurrentUrl.hash;
      }
    }
  }

  throw new Error("Could not allocate a unique short-link hash after 5 attempts.");
}

export async function getUrl(hash: string): Promise<string | undefined> {
  return (await (await getUrls()).findOne({ hash }))?.url;
}
