import mongoose, { type Mongoose } from "mongoose";

interface MongooseCache {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

function getMongoDbUri(): string {
  const mongodbUri = process.env.MONGODB_URI;

    console.log("MongoDB URI loaded:", !!mongodbUri);

  if (!mongodbUri) {
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  return mongodbUri;
}

// Next.js reloads modules in development. Store the cache globally to reuse it.
const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache = (globalForMongoose.mongooseCache ??= {
  connection: null,
  promise: null,
});

/** Connect to MongoDB, reusing an existing or in-flight Mongoose connection. */
export async function connectToDatabase(): Promise<Mongoose> {
  if (cache.connection) {
    return cache.connection;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(getMongoDbUri(), {
      bufferCommands: false,
    });
  }

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error: unknown) {
    // Allow a later request to retry if the initial connection attempt failed.
    cache.promise = null;
    throw error;
  }
}
