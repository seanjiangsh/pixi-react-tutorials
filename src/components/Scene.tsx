import { useRef } from "react";

import "src/components/Scene.css";
import { Scenes, SceneName } from "src/scenes/Scenes";

type SceneProps = {
  sceneName: SceneName;
};

export default function Scene({ sceneName }: SceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const SceneComponent = Scenes[sceneName];

  return (
    <div className="scene" ref={sceneRef}>
      <SceneComponent containerRef={sceneRef} />
    </div>
  );
}
