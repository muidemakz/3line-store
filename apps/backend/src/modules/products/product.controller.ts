import { Request, Response } from 'express';
import { productService } from './product.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
} from '../../validators/product.validator';

/**
 * Build the public URL for an uploaded file.
 * The product routes use disk storage, so req.file.filename is the saved name.
 * Express serves /uploads via static middleware, so the URL is:
 *   http(s)://<host>/uploads/<filename>
 */
function fileUrl(req: Request): string {
  const fwd = req.headers['x-forwarded-proto'];
  const protocol = (Array.isArray(fwd) ? fwd[0] : fwd) ?? req.protocol;
  const host = req.get('host') ?? 'localhost:5000';
  return `${protocol}://${host}/uploads/${req.file!.filename}`;
}

export class ProductController {
  listProducts = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as unknown as ProductFilterInput;
    const result = await productService.listProducts(filters);
    return sendSuccess(res, result.data, 'Products fetched', 200, result.meta);
  });

  listAllProducts = asyncHandler(async (_req: Request, res: Response) => {
    const products = await productService.listAllProducts();
    return sendSuccess(res, products, 'All products fetched');
  });

  getProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productService.getProduct(id);
    return sendSuccess(res, product, 'Product fetched');
  });

  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateProductInput;

    // File saved to disk by multer — build its public URL
    if (req.file) {
      body.image = fileUrl(req);
    }

    const product = await productService.createProduct(body);
    return sendCreated(res, product, 'Product created successfully');
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateProductInput;

    // File saved to disk by multer — build its public URL
    if (req.file) {
      body.image = fileUrl(req);
    }

    const product = await productService.updateProduct(id, body);
    return sendSuccess(res, product, 'Product updated successfully');
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await productService.deleteProduct(id);
    return sendNoContent(res);
  });
}

export const productController = new ProductController();
