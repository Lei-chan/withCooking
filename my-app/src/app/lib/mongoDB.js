import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("No MongoDB URI is provided");

let cached = global.mongoose;
let bucket;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise)
      cached.promise = mongoose
        .connect(MONGODB_URI, {
          bufferCommands: false,
        })
        .then((mongoose) => mongoose);

    cached.conn = await cached.promise;
    console.log("connected to MongoDB!");
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export function getGridFSBucket() {
  return !bucket
    ? new GridFSBucket(mongoose.connection.db, { bucketName: "recipeFiles" })
    : bucket;
}
