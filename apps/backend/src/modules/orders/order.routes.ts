import { Router } from 'express';
import { orderController } from './order.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types';
import { addToCartSchema, orderFilterSchema, adminCreateOrderSchema } from '../../validators/order.validator';

const router = Router();

router.use(authenticate);

// ─── Cart Routes ──────────────────────────────────────────
router.get('/cart', orderController.getCart);
router.post('/cart', validate(addToCartSchema), orderController.addToCart);

// ─── Checkout ─────────────────────────────────────────────
router.post('/checkout', orderController.checkout);

// ─── Order History ────────────────────────────────────────
router.get('/history', validate(orderFilterSchema, 'query'), orderController.getOrderHistory);

// ─── Admin: All Orders ────────────────────────────────────
router.get(
  '/admin/all',
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getAllOrders
);

// ─── Admin: Global Shopping List ──────────────────────────
router.get(
  '/admin/shopping-list',
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getGlobalShoppingList
);

// ─── Admin: Create order on behalf of a user ─────────────
router.post(
  '/admin/create',
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  validate(adminCreateOrderSchema),
  orderController.adminCreateOrder
);

// ─── Admin: Enrolled users for a session ─────────────────
router.get(
  '/admin/enrolled-users/:sessionId',
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getEnrolledUsers
);

export default router;
