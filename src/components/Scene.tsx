import { useEffect, useRef } from "react";
import { Application, useApplication } from "@pixi/react";
import { Stats } from "pixi-stats";
import { useControls, Leva } from "leva";

import "src/components/Scene.css";
import { Scenes, SceneName } from "src/scenes/Scenes";
import useSceneSize from "src/utils/hooks/useSceneSize";

type SceneProps = {
  sceneName: SceneName;
};

// Component inside Application to access the Pixi app
function PixiStats({ showStats }: { showStats: boolean }) {
  const { app } = useApplication();
  const statsRef = useRef<Stats | null>(null);

  useEffect(() => {
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
  const SceneComponent = Scenes[sceneName];

  // Pixi Stats controls - use high order number to appear at the bottom
  const { showStats } = useControls(
    "Pixi Stats",
    { showStats: { value: true, label: "Show Stats" } },
    { collapsed: true, order: 9999 }
  );

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
      >
        <PixiStats showStats={showStats} />
        <SceneComponent isPixi />
      </Application>
    </div>
  );
}
