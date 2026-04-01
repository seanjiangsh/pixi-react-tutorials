import { useEffect } from "react";
import { SceneProps } from "src/scenes/Scenes";
import { useSceneStore } from "src/stores/useSceneStore";
import { BlurryAreaPixi } from "src/scenes/blurry-area/BlurryAreaPixi";

export default function BlurryArea({ isPixi }: SceneProps) {
  const { setCanvasPointerEvents } = useSceneStore();

  useEffect(() => {
    setCanvasPointerEvents("auto");
  }, [setCanvasPointerEvents]);

  if (!isPixi) return null;
  return <BlurryAreaPixi />;
}
