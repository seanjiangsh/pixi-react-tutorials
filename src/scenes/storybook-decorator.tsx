import { useRef, useEffect } from "react";
import { Application } from "@pixi/react";
import type { Decorator } from "@storybook/react-vite";

export const PixiSceneDecorator: Decorator = (Story, context) => {
  const appRef = useRef<HTMLDivElement>(null);

  // Hide Leva panel in Storybook
  useEffect(() => {
    const levaRoot = document.querySelector(".leva-c-kWgxhW");
    if (levaRoot instanceof HTMLElement) {
      levaRoot.style.display = "none";
    }
  }, []);

  return (
    <div
      ref={appRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* DOM elements overlay for components like GridOverlay */}
      <div className="scene-overlay">
        <Story args={{ ...context.args, isPixi: false }} />
      </div>
      {/* Pixi elements */}
      <Application
        width={window.innerWidth}
        height={window.innerHeight}
        resizeTo={appRef}
        onInit={(app) => (app.ticker.maxFPS = 30)}
      >
        <Story args={{ ...context.args, isPixi: true }} />
      </Application>
    </div>
  );
};
