import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startNotificationScheduler } from "./lib/notifications";

createRoot(document.getElementById("root")!).render(<App />);

// Start notification scheduler if enabled
startNotificationScheduler();
