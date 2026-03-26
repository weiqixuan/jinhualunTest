import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "antd/dist/reset.css";
import "./styles/global.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container not found");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
