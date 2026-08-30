import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "../popup/styles.css";
import "../popup/auth-forms.css";
import "./vault-app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
