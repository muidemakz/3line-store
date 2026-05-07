/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Set to `true` only for local demos — uses DummyJSON auth in dev. Omit or `false` for real API. */
  readonly VITE_USE_AUTH_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
