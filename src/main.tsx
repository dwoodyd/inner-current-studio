import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startNotificationScheduler } from "./lib/notifications";
import { registerServiceWorker } from "./lib/push";

createRoot(document.getElementById("root")!).render(<App />);

// Start notification scheduler if enabled
startNotificationScheduler();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

// Always unregister any existing service worker + nuke caches.
// The previous SW cached JS chunks aggressively and broke navigation after
// each publish. We re-enable a clean SW in a future release.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  }).catch(() => undefined);
  if (typeof caches !== 'undefined') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => undefined);
  }
}

// Auto-reload once when a lazy chunk fails to load (typically right after a
// new deploy invalidated old hashed filenames). Prevents the user from ever
// seeing a "needs a refresh" screen.
const RELOAD_FLAG = 'iw_chunk_reload_at';
function isChunkLoadError(message: string): boolean {
  return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i.test(message);
}
function maybeReload() {
  const last = Number(sessionStorage.getItem(RELOAD_FLAG) || '0');
  if (Date.now() - last < 10_000) return; // avoid loop
  sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  window.location.reload();
}
window.addEventListener('error', (e) => {
  if (e?.message && isChunkLoadError(e.message)) maybeReload();
});
window.addEventListener('unhandledrejection', (e) => {
  const msg = (e?.reason?.message ?? String(e?.reason ?? '')) as string;
  if (isChunkLoadError(msg)) maybeReload();
});
