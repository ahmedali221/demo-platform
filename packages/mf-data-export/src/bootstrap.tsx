import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./lib/i18n";
import App from "./App";

// Only render if running as standalone app (has a root element)
// When used as a module federation remote, components are imported directly
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
