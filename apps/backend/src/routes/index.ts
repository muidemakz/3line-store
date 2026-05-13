import { Router } from 'express';
import { env } from '../config/env';
import v1Router from './v1';

const router = Router();

/**
 * Mount versioned API routes.
 * /api/v1/* → v1Router
 */
router.use(`/${env.API_VERSION}`, v1Router);

export default router;
