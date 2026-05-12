import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import { AppError } from '../../utils/AppError';
import type { RegisterInput, LoginInput, RefreshTokenInput, ForgotPasswordInput, ResetPasswordInput } from '../../validators/auth.validator';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as RegisterInput;
    const result = await authService.register(body);

    return sendCreated(res, result, 'Account created successfully');
  });

  /**
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as LoginInput;
    const result = await authService.login(body);

    return sendSuccess(res, result, 'Login successful', StatusCodes.OK);
  });

  /**
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as RefreshTokenInput;
    const tokens = await authService.refreshTokens(body);

    return sendSuccess(res, tokens, 'Tokens refreshed');
  });

  /**
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      throw AppError.badRequest('Refresh token is required to logout');
    }

    await authService.logout(refreshToken);

    return sendNoContent(res);
  });

  /**
   * POST /api/v1/auth/logout-all
   * Revokes all sessions for the authenticated user.
   */
  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutAll(req.user!.id);

    return sendNoContent(res);
  });

  /**
   * GET /api/v1/auth/me
   */
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);

    return sendSuccess(res, user, 'Profile fetched');
  });

  /**
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as ForgotPasswordInput;
    // Build the reset URL using the Origin header or a fallback
    const origin = req.get('origin') ?? req.get('referer')?.replace(/\/$/, '') ?? 'http://localhost:5173';
    const resetBaseUrl = `${origin}/reset-password`;
    const result = await authService.forgotPassword(email, resetBaseUrl);
    return sendSuccess(res, result, 'If an account exists, a reset link has been sent');
  });

  /**
   * POST /api/v1/auth/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body as ResetPasswordInput;
    await authService.resetPassword(token, password);
    return sendSuccess(res, null, 'Password has been reset successfully. Please sign in.');
  });
}

export const authController = new AuthController();
