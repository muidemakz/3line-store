import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types';
import {
  createProductSchema,
  updateProductSchema,
} from '../../validators/product.validator';
import { idParamSchema } from '../../validators/common.validator';

const router = Router();

// ─── Public/User Routes (Requires Authentication) ─────────
router.use(authenticate);

router.get('/', productController.listProducts);
router.get('/:id', validate(idParamSchema, 'params'), productController.getProduct);

// ─── Admin Routes ─────────────────────────────────────────
router.use(authorize(Role.ADMIN, Role.SUPER_ADMIN));

router.get('/admin/all', productController.listAllProducts);

router.post(
  '/',
  upload.single('image'),
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  '/:id',
  upload.single('image'),
  validate(idParamSchema, 'params'),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  productController.deleteProduct
);

export default router;
