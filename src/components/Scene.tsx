import { lazy, Suspense } from "react";

import "./Scene.css";
import { ThemeLoader, ThemeName } from "../scenes/sceneLoader";

type SceneProps = {
  sceneName: ThemeName;
};

export default function Scene({ sceneName }: SceneProps) {
  const LazyComponent = lazy(ThemeLoader[sceneName]);

  return (
    <div className="scene">
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
