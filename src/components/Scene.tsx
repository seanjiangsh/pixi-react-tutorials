import { useEffect, useRef, useState } from "react";
import { Application } from "@pixi/react";
import { Stats } from "pixi-stats";
import { useControls, Leva } from "leva";
import type { Application as PixiApplication } from "pixi.js";

import "src/components/Scene.css";
import { Scenes, SceneName } from "src/scenes/Scenes";
import useSceneSize from "src/utils/hooks/useSceneSize";

type SceneProps = {
  sceneName: SceneName;
};

// Component inside Application to manage stats display
type PixiStatsProps = {
  showStats: boolean;
  app: PixiApplication | null;
};
function PixiStats(props: PixiStatsProps) {
  const { showStats, app } = props;
  const statsRef = useRef<Stats | null>(null);

  useEffect(() => {
    if (!app) return;

    const cleanup = () => {
      if (!statsRef.current) return;
      statsRef.current.removeDomElement();
      statsRef.current = null;
    };

    if (showStats && !statsRef.current) {
      const stats = new Stats(app.renderer, app.ticker);
      statsRef.current = stats;
    } else if (!showStats && statsRef.current) {
      cleanup();
    }

    return cleanup;
  }, [showStats, app]);

  return null;
}

export default function Scene({ sceneName }: SceneProps) {
  const { width, height } = useSceneSize();
  const appRef = useRef<HTMLDivElement>(null);
  const [pixiApp, setPixiApp] = useState<PixiApplication | null>(null);
  const SceneComponent = Scenes[sceneName];

  // Pixi Stats controls - use high order number to appear at the bottom
  const { showStats } = useControls(
    "Pixi Stats",
    { showStats: { value: true, label: "Show Stats" } },
    { collapsed: true, order: 9999 }
  );

  // Configure Application initialization with 30 FPS and store app reference
  const onInit = (app: PixiApplication) => {
    app.ticker.maxFPS = 30;
    app.ticker.minFPS = 30;
    setPixiApp(app);
  };

  return (
    <div className="scene" ref={appRef}>
      {/* DOM elements */}
      <div className="scene-overlay">
        <SceneComponent />
        {/* Single Leva instance for all controls */}
        <Leva collapsed={true} />
      </div>
      {/* Pixi elements rendered inside Application */}
      <Application
        width={width}
        height={height}
        backgroundAlpha={0}
        resizeTo={appRef}
        onInit={onInit}
      >
        <PixiStats showStats={showStats} app={pixiApp} />
        <SceneComponent isPixi />
      </Application>
    </div>
  );
}
