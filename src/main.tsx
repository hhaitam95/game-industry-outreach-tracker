import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./vendor/bootstrap.min.css";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
