import crypto from 'crypto';
import { prisma } from '../../config/database';
import { hashPassword, comparePasswords } from '../../utils/bcrypt';
import { generateAuthTokens, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../utils/AppError';
import { excludeFields } from '../../utils/helpers';
import { TokenType, UserStatus } from '@prisma/client';
import { EmailService } from '../../services/email.service';
import type { RegisterInput, LoginInput, RefreshTokenInput } from '../../validators/auth.validator';
import type { AuthTokens, AuthUser } from '../../types';

export class AuthService {
  // ─── Register ─────────────────────────────────────────────

  async register(data: RegisterInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    // Check if email already taken
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    // ── Business Logic: Auto-assign Grade & Points ──────────
    
    // Find a default grade (e.g., 'Grade A') if none provided
    const defaultGrade = await prisma.gradeLevel.findFirst({
      where: { name: { contains: 'Grade A' } },
    });

    // Find the current active session
    const activeSession = await prisma.session.findFirst({
      where: { isActive: true },
    });

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        gradeLevelId: defaultGrade?.id,
        profile: { create: {} },
        // If there's an active session, allocate points immediately
        ...(activeSession && defaultGrade && {
          sessionPoints: {
            create: {
              sessionId: activeSession.id,
              allocatedPoints: defaultGrade.defaultPoints,
              remainingPoints: defaultGrade.defaultPoints,
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    const tokens = generateAuthTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Persist refresh token
    await this._saveRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  // ─── Login ────────────────────────────────────────────────

  async login(data: LoginInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Use a generic message to prevent user enumeration
    if (!user || !(await comparePasswords(data.password, user.password))) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw AppError.forbidden('Your account has been suspended. Contact support.');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw AppError.forbidden('Your account is inactive.');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = generateAuthTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this._saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: excludeFields(user, ['password']),
      tokens,
    };
  }

  // ─── Refresh Token ────────────────────────────────────────

  async refreshTokens(data: RefreshTokenInput): Promise<AuthTokens> {
    const payload = verifyRefreshToken(data.refreshToken);

    // Check token exists in DB (acts as a revocation list)
    const stored = await prisma.token.findUnique({
      where: { token: data.refreshToken },
      include: { user: { select: { id: true, email: true, role: true, status: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token is invalid or expired');
    }

    // Rotate: delete old token
    await prisma.token.delete({ where: { id: stored.id } });

    const tokens = generateAuthTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    await this._saveRefreshToken(payload.sub, tokens.refreshToken);

    return tokens;
  }

  // ─── Logout ───────────────────────────────────────────────

  async logout(refreshToken: string): Promise<void> {
    await prisma.token.deleteMany({ where: { token: refreshToken } });
  }

  // ─── Logout All Devices ───────────────────────────────────

  async logoutAll(userId: string): Promise<void> {
    await prisma.token.deleteMany({
      where: { userId, type: TokenType.REFRESH },
    });
  }

  // ─── Me ───────────────────────────────────────────────────

  async getMe(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (!user) throw AppError.notFound('User');
    return user;
  }

  // ─── Forgot Password ──────────────────────────────────────

  /**
   * Generate a password-reset token for the given email.
   * - If SMTP is configured: sends an email and returns { emailSent: true }
   * - If SMTP is NOT configured: returns { emailSent: false, resetToken } so
   *   the admin UI can surface the token manually.
   * Always returns 200 even when email not found (prevents enumeration).
   */
  async forgotPassword(email: string, resetBaseUrl: string): Promise<{ emailSent: boolean; resetToken?: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether the email exists
      return { emailSent: true };
    }

    // Invalidate any previous reset tokens for this user
    await prisma.token.deleteMany({
      where: { userId: user.id, type: TokenType.PASSWORD_RESET },
    });

    // Generate a secure random token (hex, 32 bytes = 64 chars)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.token.create({
      data: { userId: user.id, token: rawToken, type: TokenType.PASSWORD_RESET, expiresAt },
    });

    const resetUrl = `${resetBaseUrl}?token=${rawToken}`;

    // Try to send email — falls back gracefully if SMTP is not configured
    const emailSent = await EmailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
    }).then(() => true).catch(() => false);

    if (!emailSent) {
      // Return token so admin UI can copy it manually
      return { emailSent: false, resetToken: rawToken };
    }

    return { emailSent: true };
  }

  // ─── Reset Password ───────────────────────────────────────

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await prisma.token.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.type !== TokenType.PASSWORD_RESET) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    if (record.expiresAt < new Date()) {
      await prisma.token.delete({ where: { token } });
      throw AppError.badRequest('Reset token has expired. Please request a new one.');
    }

    const hashed = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      prisma.token.delete({ where: { token } }),
      // Invalidate all refresh tokens so existing sessions are cleared
      prisma.token.deleteMany({ where: { userId: record.userId, type: TokenType.REFRESH } }),
    ]);
  }

  // ─── Private helpers ──────────────────────────────────────

  private async _saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.token.create({
      data: {
        userId,
        token,
        type: TokenType.REFRESH,
        expiresAt,
      },
    });
  }
}

export const authService = new AuthService();
