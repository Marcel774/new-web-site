import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const configuredUri = process.env.MONGODB_URI?.trim();

    if (configuredUri) {
      await mongoose.connect(configuredUri);
      console.log('[MOVIEFLIX] Connected to configured MongoDB instance.');
      return mongoose;
    }

    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'movieflix',
      },
    });
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log('[MOVIEFLIX] Connected to embedded MongoDB server (dev/preview mode).');
    return mongoose;
  })();

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  connectionPromise = null;
}
