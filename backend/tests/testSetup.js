import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer = null;

/**
 * Start a fresh in-memory MongoDB instance and connect mongoose to it.
 * If mongoose already has an active connection, disconnect first to avoid
 * "Can't call openUri() on an active connection" errors.
 *
 * Returns the mongo URI that was connected to.
 */
export async function setupTestDB() {
  // If mongoose is in any non-disconnected state, disconnect first
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (err) {
      // swallow - we'll try to reconnect below
    }
  }

  // Start a new in-memory server and connect
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // connect mongoose
  await mongoose.connect(uri);

  return uri;
}

/**
 * Tear down mongoose connection and stop the in-memory server if running.
 */
export async function teardownTestDB() {
  // Only disconnect if mongoose is connected/connecting
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (err) {
      // ignore errors during disconnect
    }
  }

  // Stop the in-memory server if it exists
  if (mongoServer) {
    try {
      await mongoServer.stop();
    } catch (err) {
      // ignore
    } finally {
      mongoServer = null;
    }
  }
}

/**
 * Clear all collections in the current mongoose connection if connected.
 */
export async function clearDatabase() {
  // Only attempt to clear when connected
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      try {
        await collections[key].deleteMany({});
      } catch (err) {
        // ignore individual collection clear errors
      }
    }
  }
}
