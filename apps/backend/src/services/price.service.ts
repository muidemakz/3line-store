import { prisma } from '../config/database';

const DEFAULT_RATE = 500; // ₦500 = 1 PT fallback
const CONFIG_KEY = 'nairaPerPoint';

export class PriceService {
  /**
   * Get the current naira-per-point conversion rate from the database.
   * Falls back to DEFAULT_RATE if not configured.
   */
  static async getRate(): Promise<number> {
    try {
      const row = await prisma.config.findUnique({ where: { key: CONFIG_KEY } });
      return row ? Number(row.value) : DEFAULT_RATE;
    } catch {
      return DEFAULT_RATE;
    }
  }

  /**
   * Calculates points price from Naira price using the stored rate.
   */
  static async nairaToPoints(nairaAmount: number): Promise<number> {
    const rate = await this.getRate();
    return Math.ceil(nairaAmount / rate);
  }

  /**
   * Synchronous fallback (uses default rate) — for cases where
   * an async call is not practical.
   */
  static nairaToPointsSync(nairaAmount: number, rate = DEFAULT_RATE): number {
    return Math.ceil(nairaAmount / rate);
  }
}
