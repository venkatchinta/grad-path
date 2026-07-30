import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { applyAppearance, loadAppearance } from "./theme.js";
import "./styles.css";

// Apply the saved theme before first render so there's no flash of the default.
applyAppearance(loadAppearance());

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is progressive enhancement */
    });
  });
}
