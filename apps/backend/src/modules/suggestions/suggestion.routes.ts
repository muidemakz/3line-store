import { Router } from 'express';
import { suggestionController } from './suggestion.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types';
import {
  createSuggestionSchema,
  suggestionFilterSchema,
} from '../../validators/suggestion.validator';
import { idParamSchema } from '../../validators/common.validator';

const router = Router();

router.use(authenticate);

// ─── User Routes ───────────────────────────────────────────
router.get('/', validate(suggestionFilterSchema, 'query'), suggestionController.listSuggestions);
router.get('/ranking', suggestionController.getTopRanking);
router.post('/', validate(createSuggestionSchema), suggestionController.createSuggestion);
router.post('/:id/vote', validate(idParamSchema, 'params'), suggestionController.toggleVote);
router.delete('/:id', validate(idParamSchema, 'params'), suggestionController.deleteSuggestion);

// ─── Admin Analytics ───────────────────────────────────────
router.get(
  '/:id/voters',
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  validate(idParamSchema, 'params'),
  suggestionController.getVoters,
);

export default router;
