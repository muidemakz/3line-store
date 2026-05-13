import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './config/logger';
import { setupSwagger } from './config/swagger';
import { sessionService } from './modules/sessions/session.service';

const app = createApp();

async function bootstrap(): Promise<void> {
  try {
    // ── Connect to PostgreSQL via Prisma ───────────────────
    await connectDatabase();
    logger.info('✅ Database connected');

    // ── Start HTTP server ──────────────────────────────────
    const server = app.listen(env.PORT, () => {
      // Setup Swagger
      setupSwagger(app as any, env.PORT);

      logger.info(`🚀 Server running in ${env.NODE_ENV} mode`);
      logger.info(`📡 Listening on http://localhost:${env.PORT}`);
      logger.info(`🔗 API base: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
      logger.info(`❤️  Health: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
    });

    // ── Session expiry cron (runs every minute) ────────────
    const runExpiryCheck = async () => {
      try {
        const expired = await sessionService.handleExpirations();
        if (expired > 0) {
          logger.info(`⏰ Auto-deactivated ${expired} expired session(s)`);
        }
      } catch (err) {
        logger.error('Session expiry check failed:', err);
      }
    };

    // Run once on startup then every 60 seconds
    runExpiryCheck();
    const expiryTimer = setInterval(runExpiryCheck, 60_000);

    // ── Graceful shutdown ──────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`⚠️  ${signal} received — shutting down gracefully`);

      clearInterval(expiryTimer);
      server.close(async () => {
        logger.info('🔒 HTTP server closed');
        await disconnectDatabase();
        logger.info('🔒 Database disconnected');
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ── Unhandled rejections / exceptions ─────────────────
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Rejection:', reason);
      // Let the process crash so a process manager (PM2/k8s) can restart it
      process.exit(1);
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
