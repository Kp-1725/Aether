import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply saved theme color on load
const savedColor = localStorage.getItem("decentrachat-theme-color");
if (savedColor) {
  const colorMap: Record<string, string> = {
    purple: "265",
    blue: "220",
    green: "142",
    orange: "24",
    pink: "330",
    cyan: "185",
  };
  const hue = colorMap[savedColor] || "265";
  document.documentElement.style.setProperty("--primary-hue", hue);
}

createRoot(document.getElementById("root")!).render(<App />);
