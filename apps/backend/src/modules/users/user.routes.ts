import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types';
import { adminCreateUserSchema, updateUserStatusSchema, updateUserSchema } from '../../validators/user.validator';
import { idParamSchema } from '../../validators/common.validator';

const router = Router();

// All routes require authentication + admin role
router.use(authenticate);
router.use(authorize(Role.ADMIN, Role.SUPER_ADMIN));

// List all users
router.get('/', userController.listUsers);

// Create a new user (auto-generates password + sends welcome email)
router.post('/', validate(adminCreateUserSchema), userController.createUser);

// Update user status (ACTIVE / INACTIVE / SUSPENDED)
router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(updateUserStatusSchema),
  userController.updateUserStatus
);

// Full user edit (name, email, role, grade level, phone)
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  userController.updateUser
);

// Delete a user
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  userController.deleteUser
);

export default router;
