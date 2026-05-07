/**
 * When true, sign-in uses DummyJSON (dev/demo) instead of POST /auth/login.
 *
 * - Production: always false.
 * - Development: true if you have no real API URL, or URL is DummyJSON.
 * - Set `VITE_API_BASE_URL` to your own backend → real login (unless `VITE_USE_AUTH_MOCK=true`).
 * - Force mock: `VITE_USE_AUTH_MOCK=true`. Force real: `VITE_USE_AUTH_MOCK=false`.
 */
export function isDevAuthMockEnabled(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }

  const override = import.meta.env.VITE_USE_AUTH_MOCK;
  if (override === 'false') {
    return false;
  }
  if (override === 'true') {
    return true;
  }

  const apiUrl = import.meta.env.VITE_API_BASE_URL?.trim().toLowerCase() ?? '';
  if (!apiUrl) {
    return true;
  }
  if (apiUrl.includes('dummyjson.com')) {
    return true;
  }
  return false;
}
