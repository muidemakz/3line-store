import { Request, Response } from 'express';
import { orderService } from './order.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import type { AddToCartInput, OrderFilterInput, AdminCreateOrderInput } from '../../validators/order.validator';

export class OrderController {
  // ─── Cart ──────────────────────────────────────────────────
  getCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await orderService.getCart(req.user!.id);
    return sendSuccess(res, cart, 'Cart fetched');
  });

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body as AddToCartInput;
    const item = await orderService.addToCart(req.user!.id, productId, quantity);
    return sendSuccess(res, item, 'Item added to cart');
  });

  // ─── Checkout ──────────────────────────────────────────────
  checkout = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.body?.sessionId as string | undefined;
    const order = await orderService.checkout(req.user!.id, sessionId);
    return sendCreated(res, order, 'Order placed successfully');
  });

  // ─── History ───────────────────────────────────────────────
  getOrderHistory = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as unknown as OrderFilterInput;
    const result = await orderService.getOrderHistory(req.user!.id, filters);
    return sendSuccess(res, result.data, 'Order history fetched', 200, result.meta);
  });

  // ─── Admin: All Orders ─────────────────────────────────────
  getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string | undefined;
    const orders = await orderService.getAllOrders(sessionId);
    return sendSuccess(res, orders, 'All orders fetched');
  });

  // ─── Admin Aggregation ─────────────────────────────────────
  getGlobalShoppingList = asyncHandler(async (_req: Request, res: Response) => {
    const list = await orderService.getGlobalShoppingList();
    return sendSuccess(res, list, 'Global shopping list aggregated');
  });

  // ─── Admin: Create order on behalf of a user ───────────────
  adminCreateOrder = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as AdminCreateOrderInput;
    const order = await orderService.adminCreateOrder(body);
    return sendCreated(res, order, 'Order created successfully');
  });

  // ─── Admin: Users enrolled in a session ────────────────────
  getEnrolledUsers = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const users = await orderService.getEnrolledUsers(sessionId);
    return sendSuccess(res, users, 'Enrolled users fetched');
  });
}

export const orderController = new OrderController();
