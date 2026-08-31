// Paddle client-side tokens.
//
// These are PUBLISHABLE by design (they ship in the browser bundle and can only
// open a checkout — they cannot read or mutate account data). They live here,
// in source, rather than in .env files so the published build always has the
// right token; .env.production / .env.development are gitignored and only used
// for local overrides.
//
// Anything secret (Paddle API key, webhook secret, VAPID private key, Resend
// key) stays server-side in the backend secret store and is never imported here.

const LIVE_CLIENT_TOKEN = "live_527e0cf153ba88b701003498808";
const TEST_CLIENT_TOKEN = "test_e755c36a6052fd290d71e392b7b";

/** Optional local override, e.g. to force test mode in a production build. */
const override = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export const PADDLE_CLIENT_TOKEN =
  override && override.length > 0
    ? override
    : import.meta.env.PROD
      ? LIVE_CLIENT_TOKEN
      : TEST_CLIENT_TOKEN;

export type PaddleEnv = "sandbox" | "live";

export function paddleEnvFromToken(token: string | undefined | null): PaddleEnv {
  return token?.startsWith("test_") ? "sandbox" : "live";
}

export const PADDLE_ENV: PaddleEnv = paddleEnvFromToken(PADDLE_CLIENT_TOKEN);
export const IS_PAYMENTS_TEST_MODE = PADDLE_ENV === "sandbox";
