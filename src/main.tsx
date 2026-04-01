import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { HashRouter } from "react-router-dom";

import App from "src/App.tsx";
import { initSceneFromHash } from "src/stores/useSceneStore";

// Initialize scene from hash before rendering (HashRouter)
initSceneFromHash();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
