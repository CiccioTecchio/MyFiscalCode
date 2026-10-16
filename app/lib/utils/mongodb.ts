import mongoose from "mongoose";
import process from "process";

const MONGODB_USERNAME = process.env.MONGODB_USERNAME || "my_username";
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || "my_pwd";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "myfiscalcode";
const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@localhost:27017/${MONGODB_DB_NAME}?retryWrites=true&w=majority`;

let connectionPromise: Promise<typeof mongoose> | null = null;

export function dbConnect() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
    });
  }

  return connectionPromise;
}
