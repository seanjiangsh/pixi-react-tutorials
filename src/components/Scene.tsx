import { useRef } from "react";

import "src/components/Scene.css";
import { ThemeLoader, ThemeName } from "src/scenes/sceneLoader";

type SceneProps = {
  sceneName: ThemeName;
};

export default function Scene({ sceneName }: SceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const SceneComponent = ThemeLoader[sceneName];

  return (
    <div className="scene" ref={sceneRef}>
      <SceneComponent containerRef={sceneRef} />
    </div>
  );
}
