import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

// ─── Transporter ──────────────────────────────────────────────────────────────

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null; // will fall back to console log
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

// ─── Email Service ────────────────────────────────────────────────────────────

export class EmailService {
  /**
   * Send a welcome email to a newly created user with their login credentials.
   * Falls back to console.log when SMTP is not configured (great for development).
   */
  static async sendWelcomeEmail(opts: {
    to: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    loginUrl?: string;
  }): Promise<void> {
    const { to, firstName, lastName, email, password, loginUrl = 'http://localhost:5173/login' } = opts;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to 3Line Store</title></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: #1a1a2e; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">3Line Store</h1>
              <p style="color: #a0a0c0; margin: 6px 0 0; font-size: 14px;">Palliative Shopping Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 32px;">
              <h2 style="color: #1a1a2e; margin: 0 0 12px; font-size: 20px;">Welcome, ${firstName}! 👋</h2>
              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Your account has been set up on <strong>3Line Store</strong>. You can now log in to the marketplace using the credentials below.
              </p>

              <!-- Credentials box -->
              <div style="background: #f0f4ff; border: 1px solid #d0d8ff; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
                <p style="margin: 0 0 12px; color: #333; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Credentials</p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 6px 0; color: #666; font-size: 14px; width: 100px;">Email:</td>
                    <td style="padding: 6px 0; color: #1a1a2e; font-size: 14px; font-weight: 600;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #666; font-size: 14px;">Password:</td>
                    <td style="padding: 6px 0;">
                      <code style="background: #fff; border: 1px solid #dde; padding: 3px 10px; border-radius: 4px; font-size: 15px; letter-spacing: 1px; color: #1a1a2e;">${password}</code>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #888; font-size: 13px; margin: 0 0 24px;">
                ⚠️ For security, please change your password after your first login.
              </p>

              <!-- CTA button -->
              <div style="text-align: center; margin-bottom: 8px;">
                <a href="${loginUrl}"
                  style="background: #1a1a2e; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">
                  Login to Marketplace →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f8f8; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                This email was sent to ${to} by 3Line Store. If you didn't expect this, please ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const transporter = createTransporter();

    if (!transporter) {
      // No SMTP config — log credentials to console in development
      logger.warn('═══════════════════════════════════════════════════════');
      logger.warn('⚠  SMTP not configured — printing credentials to console');
      logger.warn(`   To: ${to}`);
      logger.warn(`   Name: ${firstName} ${lastName}`);
      logger.warn(`   Email: ${email}`);
      logger.warn(`   Password: ${password}`);
      logger.warn('   Configure SMTP_HOST/SMTP_USER/SMTP_PASS in .env to send real emails');
      logger.warn('═══════════════════════════════════════════════════════');
      return;
    }

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: `Welcome to 3Line Store — your login credentials`,
      html,
      text: `Welcome ${firstName}!\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n\nLogin at: ${loginUrl}\n\nPlease change your password after first login.`,
    });

    logger.info(`Welcome email sent to ${to}`);
  }

  /**
   * Send a password-reset email.
   * Throws (returns rejected promise) when SMTP is not configured so the
   * caller can detect the failure and surface the token manually.
   */
  static async sendPasswordResetEmail(opts: {
    to: string;
    firstName: string;
    resetUrl: string;
  }): Promise<void> {
    const { to, firstName, resetUrl } = opts;

    const transporter = createTransporter();

    if (!transporter) {
      // Signal to caller that email was not sent — they will return the raw token
      throw new Error('SMTP not configured');
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset your 3Line Store password</title></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: #00012C; padding: 28px 40px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">3Line Store</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h3 style="color: #00012C; font-size: 20px; margin: 0 0 16px;">Reset your password</h3>
              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${firstName}, we received a request to reset your password. Click the button below — the link expires in 30 minutes.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background: #00012C; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Reset Password →
                </a>
              </div>
              <p style="color: #999; font-size: 13px; margin: 24px 0 0;">
                If you didn't request this, you can safely ignore this email. Your password won't change.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f8f8; padding: 16px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">Sent to ${to} by 3Line Store.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Reset your 3Line Store password',
      html,
      text: `Hi ${firstName},\n\nReset your password here (expires in 30 min):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    });

    logger.info(`Password reset email sent to ${to}`);
  }
}
