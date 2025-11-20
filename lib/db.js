import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
console.log('MONGO_URI:', MONGO_URI);


if (!MONGO_URI) throw new Error("MONGO_URI not defined");

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false }).then((mongoose) => mongoose.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
