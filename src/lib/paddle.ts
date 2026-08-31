import { supabase } from "@/integrations/supabase/client";

import { PADDLE_CLIENT_TOKEN, PADDLE_ENV } from "@/config/payments";

const clientToken = PADDLE_CLIENT_TOKEN;

declare global {
  interface Window {
    Paddle: any;
  }
}

let paddleInitialized = false;

export function getPaddleEnv(): "sandbox" | "live" {
  return PADDLE_ENV;
}

export async function initializePaddle() {
  if (paddleInitialized) return;
  if (!clientToken) {
    throw new Error("Paddle client token is not configured");
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]');
    const onReady = () => {
      const environment = clientToken.startsWith("test_") ? "sandbox" : "production";
      window.Paddle.Environment.set(environment);
      window.Paddle.Initialize({ token: clientToken });
      paddleInitialized = true;
      resolve();
    };
    if (existing && window.Paddle) return onReady();

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = onReady;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function getPaddlePriceId(priceId: string): Promise<string> {
  const environment = getPaddleEnv();
  const { data, error } = await supabase.functions.invoke("get-paddle-price", {
    body: { priceId, environment },
  });
  if (error || !data?.paddleId) {
    throw new Error(`Failed to resolve price: ${priceId}`);
  }
  return data.paddleId;
}
