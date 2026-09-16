import { app } from './app';
import { AppConfig } from './core/config/server.config';
import { prisma } from './core/database/prisma.client'; // Import prisma
import logger from './core/utils/logger';
import { Server } from 'http';

async function shutdown(server: Server) {
  logger.info("🔻 Shutting down gracefully...");

  // 1. Stop accepting new HTTP requests
  server.close(async () => {
    logger.info("✅ Closed HTTP connections");

    // 2. Disconnect Prisma safely
    try {
      await prisma.$disconnect();
      logger.info("✅ Disconnected from Database");
      process.exit(0);
    } catch (dbErr) {
      logger.error("❌ Error disconnecting database", dbErr);
      process.exit(1);
    }
  });

  // Force exit if not closed in 10 sec
  setTimeout(() => {
    logger.error("❌ Force closing app after 10s timeout");
    process.exit(1);
  }, 10000);
}

async function main() {
  try {
    // Optional: Test DB connection before starting server
    await prisma.$connect();
    logger.info("✅ Connected to Database");

    const server = app.listen(AppConfig.port, () => {
      logger.info(`🚀 Server running on http://localhost:${AppConfig.port}`);
    });

    server.on('error', (err) => {
      logger.error('Server error:', err);
      process.exit(1);
    });

    process.on("SIGTERM", () => shutdown(server));
    process.on("SIGINT", () => shutdown(server));
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();