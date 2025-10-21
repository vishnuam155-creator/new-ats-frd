import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// src/main.tsx
import "./setup/safeFetch";
import "./setup/axiosGuards"; // only if you use axios

import React from "react";
import ReactDOM from "react-dom/client";
import {SafeErrorBoundary} from "./setup/SafeErrorBoundary"; // optional

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SafeErrorBoundary>
      <App />
    </SafeErrorBoundary>
  </React.StrictMode>
);
