import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import { AppModule } from './app.module.js';

const { Pool } = pg;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  let sessionStore: session.Store | undefined;
  if (process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const PgSession = connectPgSimple(session);
      sessionStore = new PgSession({
        pool,
        createTableIfMissing: true,
      });
    } catch (error) {
      logger.error(
        'Failed to initialize PostgreSQL session store, falling back to MemoryStore',
        error instanceof Error ? error.stack : String(error),
      );
    }
  } else {
    logger.warn(
      'DATABASE_URL is not set; falling back to in-memory session store (not suitable for production)',
    );
  }

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET ?? 'dev-secret-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    }),
  );

  const port = process.env.PORT ?? 4254;
  logger.log(`Resolved PORT env var: ${JSON.stringify(process.env.PORT)} — binding to ${port} on 0.0.0.0`);
  // Bind explicitly to 0.0.0.0 — without a host, some container network
  // setups (Railway included) don't route external/proxy traffic to the
  // process even though it's running fine internally.
  await app.listen(port, '0.0.0.0');
  logger.log(`Listening — app.getUrl() reports: ${await app.getUrl()}`);
}

bootstrap();
