import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";

import App from "src/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/pixi-react-tutorials">
      <App />
    </BrowserRouter>
  </StrictMode>
);
