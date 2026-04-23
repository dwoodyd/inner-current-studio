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

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
} else {
  registerServiceWorker();
}
