import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { parsePagination, buildPaginationMeta } from '../../utils/helpers';
import { OrderStatus } from '@prisma/client';
import type { OrderFilterInput, AdminCreateOrderInput } from '../../validators/order.validator';

export class OrderService {
  /**
   * Add or update item in cart
   */
  async addToCart(userId: string, productId: string, quantity: number) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw AppError.notFound('Product');

    return prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity },
      create: { userId, productId, quantity },
    });
  }

  /**
   * Get user's current cart
   */
  async getCart(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            pointsPrice: true,
            stockQuantity: true,
            image: true,
            sessionId: true,
          },
        },
      },
    });
  }

  /**
   * THE TRANSACTIONAL CHECKOUT
   */
  async checkout(userId: string, sessionId?: string) {
    // 1. Fetch Cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) throw AppError.badRequest('Cart is empty');

    // 2. Identify the session — prefer the one the user is currently viewing
    let activeSession;
    if (sessionId) {
      activeSession = await prisma.session.findUnique({ where: { id: sessionId } });
      if (!activeSession) throw AppError.badRequest('Session not found');
    } else {
      activeSession = await prisma.session.findFirst({ where: { isActive: true } });
    }
    if (!activeSession) throw AppError.badRequest('No active session for checkout');

    // 3. Calculate total points required (no stock check — stock is unlimited)
    let totalPointsRequired = 0;
    for (const item of cartItems) {
      totalPointsRequired += item.product.pointsPrice * item.quantity;
    }

    // 4. Check User Points
    const userPoints = await prisma.userSessionPoints.findUnique({
      where: {
        userId_sessionId: { userId, sessionId: activeSession.id },
      },
    });

    if (!userPoints || userPoints.remainingPoints < totalPointsRequired) {
      throw AppError.badRequest(`Insufficient points. You have ${userPoints?.remainingPoints ?? 0} PT but need ${totalPointsRequired} PT.`);
    }

    // 5. ATOMIC TRANSACTION
    return prisma.$transaction(async (tx) => {
      // A. Deduct Points
      await tx.userSessionPoints.update({
        where: { id: userPoints.id },
        data: {
          remainingPoints: { decrement: totalPointsRequired },
        },
      });

      // B. Create Order
      const order = await tx.order.create({
        data: {
          userId,
          sessionId: activeSession.id,
          totalPoints: totalPointsRequired,
          status: OrderStatus.PENDING,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              pointsPrice: item.product.pointsPrice, // Capture price at purchase
            })),
          },
        },
        include: { orderItems: true },
      });

      // C. Clear Cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });
  }

  /**
   * Admin: Create an order on behalf of a user
   */
  async adminCreateOrder(data: AdminCreateOrderInput) {
    const { sessionId, userId, items } = data;

    // Validate session exists
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw AppError.notFound('Session');

    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User');

    // Resolve products and calculate total points
    let totalPointsRequired = 0;
    const resolvedItems: { productId: string; quantity: number; pointsPrice: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw AppError.notFound(`Product "${item.productId}"`);
      totalPointsRequired += product.pointsPrice * item.quantity;
      resolvedItems.push({ productId: item.productId, quantity: item.quantity, pointsPrice: product.pointsPrice });
    }

    // Check user's available points for this session
    const userPoints = await prisma.userSessionPoints.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });

    if (!userPoints || userPoints.remainingPoints < totalPointsRequired) {
      throw AppError.badRequest(
        `Insufficient points. ${user.firstName} has ${userPoints?.remainingPoints ?? 0} PT but this order requires ${totalPointsRequired} PT.`,
      );
    }

    // Atomic: deduct points + create order
    return prisma.$transaction(async (tx) => {
      await tx.userSessionPoints.update({
        where: { id: userPoints.id },
        data: { remainingPoints: { decrement: totalPointsRequired } },
      });

      return tx.order.create({
        data: {
          userId,
          sessionId,
          totalPoints: totalPointsRequired,
          status: OrderStatus.PENDING,
          orderItems: {
            create: resolvedItems,
          },
        },
        include: {
          orderItems: { include: { product: { select: { id: true, title: true } } } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          session: { select: { id: true, name: true } },
        },
      });
    });
  }

  /**
   * Admin: Get users enrolled in a session (with remaining points)
   */
  async getEnrolledUsers(sessionId: string) {
    const records = await prisma.userSessionPoints.findMany({
      where: { sessionId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    return records.map(r => ({
      userId:          r.userId,
      firstName:       r.user.firstName,
      lastName:        r.user.lastName,
      email:           r.user.email,
      allocatedPoints: r.allocatedPoints,
      remainingPoints: r.remainingPoints,
    }));
  }

  /**
   * Order History (User)
   */
  async getOrderHistory(userId: string, filters: OrderFilterInput) {
    const { page, limit, skip } = parsePagination({ page: filters.page, limit: filters.limit });

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId,
          ...(filters.status    && { status:    filters.status }),
          ...(filters.sessionId && { sessionId: filters.sessionId }),
        },
        skip,
        take: limit,
        include: {
          orderItems: { include: { product: true } },
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { data: orders, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Admin: All orders (every user, with user + session + items)
   * Optionally filter by sessionId.
   */
  async getAllOrders(sessionId?: string) {
    return prisma.order.findMany({
      where: sessionId ? { sessionId } : undefined,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        session: { select: { id: true, name: true } },
        orderItems: {
          include: {
            product: { select: { id: true, title: true, pointsPrice: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin Aggregation: Global Shopping List
   */
  async getGlobalShoppingList() {
    // Grouping across all users to see what to procure
    const aggregation = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
          session: { isActive: true },
        },
      },
    });

    // Hydrate with product details
    const hydratedList = await Promise.all(
      aggregation.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { title: true, nairaPrice: true },
        });
        return {
          productId: item.productId,
          title: product?.title,
          totalQuantity: item._sum.quantity,
        };
      })
    );

    return hydratedList;
  }
}

export const orderService = new OrderService();
