import app from './src/app';
import { connectDB } from './src/config/db';
import { env } from './src/config/env';
import { logger } from './src/utils/logger';

const startServer = async () => {
  try {
    // 1. Initialise database connection
    await connectDB();

    // 2. Start HTTP server
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();
