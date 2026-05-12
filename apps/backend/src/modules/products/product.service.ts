import { prisma } from '../../config/database';
import { PriceService } from '../../services/price.service';
import { AppError } from '../../utils/AppError';
import { parsePagination, buildPaginationMeta } from '../../utils/helpers';
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
} from '../../validators/product.validator';

export class ProductService {
  /**
   * List products with pagination and filtering
   */
  async listProducts(filters: ProductFilterInput) {
    const { page, limit, skip } = parsePagination({
      page: filters.page,
      limit: filters.limit,
    });

    // Products are global — all active products appear in every session.
    // The sessionId on a product is audit metadata (which session it was created in)
    // but does NOT gate visibility.
    const where = {
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' as const } },
          { description: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Admin: List ALL products across all sessions
   */
  async listAllProducts() {
    return prisma.product.findMany({
      include: { session: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single product
   */
  async getProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { session: true },
    });

    if (!product) throw AppError.notFound('Product');
    return product;
  }

  /**
   * Create new product (Admin Only)
   * sessionId is optional — auto-assigns to active session if not provided.
   */
  async createProduct(data: CreateProductInput) {
    // Resolve sessionId: use provided one or fall back to active session
    let sessionId = data.sessionId;
    if (!sessionId) {
      const activeSession = await prisma.session.findFirst({ where: { isActive: true } });
      if (!activeSession) throw AppError.badRequest('No active session found. Please activate a session first or specify a session.');
      sessionId = activeSession.id;
    } else {
      const session = await prisma.session.findUnique({ where: { id: sessionId } });
      if (!session) throw AppError.notFound('Session');
    }

    // Auto-calculate points price if not explicitly provided
    const pointsPrice = data.pointsPrice != null
      ? data.pointsPrice
      : await PriceService.nairaToPoints(data.nairaPrice);

    return prisma.product.create({
      data: {
        sessionId,
        title: data.title,
        description: data.description,
        nairaPrice: data.nairaPrice,
        pointsPrice,
        stockQuantity: data.stockQuantity ?? 0,
        ...(data.image     && { image: data.image }),
        ...(data.brand     && { brand: data.brand }),
        ...(data.unit      && { unit:  data.unit  }),
      },
      include: { session: { select: { id: true, name: true } } },
    });
  }

  /**
   * Update product (Admin Only)
   */
  async updateProduct(id: string, data: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw AppError.notFound('Product');

    // Recalculate points if nairaPrice is being updated
    let pointsPrice = data.pointsPrice;
    if (data.nairaPrice != null && pointsPrice == null) {
      pointsPrice = await PriceService.nairaToPoints(data.nairaPrice);
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...(data.title        != null && { title:         data.title }),
        ...(data.description  != null && { description:   data.description }),
        ...(data.nairaPrice   != null && { nairaPrice:    data.nairaPrice }),
        ...(pointsPrice       != null && { pointsPrice }),
        ...(data.stockQuantity != null && { stockQuantity: data.stockQuantity }),
        ...(data.image        != null && { image:         data.image }),
        ...(data.brand        != null && { brand:         data.brand }),
        ...(data.unit         != null && { unit:          data.unit }),
      },
    });
  }

  /**
   * Delete product (Admin Only)
   */
  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw AppError.notFound('Product');

    await prisma.product.delete({ where: { id } });
  }
}

export const productService = new ProductService();
