import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadSettings } from "./lib/settings";

// Apply the saved theme before the first paint so every page opens in it.
document.documentElement.classList.toggle("dark", loadSettings().darkMode);

createRoot(document.getElementById("root")!).render(<App />);
