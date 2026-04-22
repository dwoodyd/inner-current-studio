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

if (!isPreviewHost) {
  registerServiceWorker();
}
