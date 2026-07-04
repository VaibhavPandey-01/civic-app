import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Connects to MongoDB using the URI from env config.
 * Logs success or exits the process on failure — a failed DB connection
 * means the server is non-functional, so we crash-fast rather than limp along.
 */
export const connectDB = async (): Promise<void> => {
  try {
    // Set public DNS servers to resolve MongoDB SRV hostnames reliably on Windows / local network configurations
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsError) {
      logger.warn('Failed to set public DNS servers, connecting with system default resolver', { dnsError });
    }

    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    process.exit(1);
  }
};
