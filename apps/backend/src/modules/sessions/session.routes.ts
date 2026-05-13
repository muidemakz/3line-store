import { Router } from 'express';
import { sessionController } from './session.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types';
import {
  createSessionSchema,
  updateSessionSchema,
  allocatePointsSchema,
} from '../../validators/session.validator';
import { idParamSchema } from '../../validators/common.validator';

const router = Router();

router.use(authenticate);

// ─── All authenticated users ──────────────────────────────
router.get('/my-points', sessionController.getUserPoints);
router.get('/', sessionController.listSessions);   // admins get all; users get active only

// ─── Admin-only ───────────────────────────────────────────
router.use(authorize(Role.ADMIN, Role.SUPER_ADMIN));

router.post('/', validate(createSessionSchema), sessionController.createSession);

router.patch(
  '/:id/activate',
  validate(idParamSchema, 'params'),
  sessionController.activateSession,
);

router.patch(
  '/:id/deactivate',
  validate(idParamSchema, 'params'),
  sessionController.deactivateSession,
);

router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateSessionSchema),
  sessionController.updateSession,
);

router.post('/allocate', validate(allocatePointsSchema), sessionController.allocatePoints);

export default router;
