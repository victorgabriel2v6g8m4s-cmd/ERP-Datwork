import 'dotenv/config';
import { createApp } from './app.js';
import prismaClient from './config/prisma.js';
import { SERVER_CONFIG } from './config/serverConfig.js';
import { CustomLogger } from './logger/CustomLogger.js';

const app = createApp();
const server = app.listen(SERVER_CONFIG.runtime.port, () => {
  CustomLogger.info(`[Server] ERP Datwork listening on port ${SERVER_CONFIG.runtime.port}`, {
    environment: SERVER_CONFIG.runtime.environment
  });
});

async function shutdown(signal: string): Promise<void> {
  CustomLogger.info(`[Server] ${signal} received; starting graceful shutdown`);
  server.close(async (error) => {
    if (error) {
      CustomLogger.error('[Server] Failed to close HTTP server cleanly', error);
      process.exitCode = 1;
    }
    await prismaClient.$disconnect();
  });
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
