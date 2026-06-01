import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./hooks/useTheme"; // side-effect: apply persisted theme before first paint
import { startNotificationScheduler } from "./lib/notifications";
import { toast } from "sonner";


createRoot(document.getElementById("root")!).render(<App />);

// Start notification scheduler if enabled
startNotificationScheduler();

// --- Service worker registration --------------------------------------------
// Only register in production-like contexts (NOT inside the Lovable editor
// preview iframe, where a caching SW would mask code changes).
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const host = window.location.hostname;
const isPreviewHost =
  host.includes('id-preview--') ||
  host.includes('lovableproject.com') ||
  host === 'localhost' ||
  host === '127.0.0.1';

if ('serviceWorker' in navigator) {
  if (isPreviewHost || isInIframe) {
    // Make absolutely sure preview/editor sessions have no SW from prior visits.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    }).catch(() => undefined);
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => undefined);
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('SW registration failed', err));
    });
  }
}

// --- Chunk-load recovery (deploy-during-session backstop) -------------------
// Versioned SW means hashed /assets/* are usually still reachable after a
// deploy. If a dynamic import still fails (e.g. the user is way behind the
// current build), we surface a brief toast and reload once.
const RELOAD_FLAG = 'iw_chunk_reload_at';
function isChunkLoadError(message: string): boolean {
  return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i.test(message);
}
function maybeReload() {
  const last = Number(sessionStorage.getItem(RELOAD_FLAG) || '0');
  if (Date.now() - last < 10_000) return; // avoid loop
  sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  try {
    toast('Updating to the latest version…', { duration: 1500 });
  } catch { /* ignore */ }
  setTimeout(() => window.location.reload(), 900);
}
window.addEventListener('error', (e) => {
  if (e?.message && isChunkLoadError(e.message)) maybeReload();
});
window.addEventListener('unhandledrejection', (e) => {
  const msg = (e?.reason?.message ?? String(e?.reason ?? '')) as string;
  if (isChunkLoadError(msg)) maybeReload();
});
