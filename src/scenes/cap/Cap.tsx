import { useEffect } from "react";
import { SceneProps } from "src/scenes/Scenes";
import { useSceneStore } from "src/stores/useSceneStore";
import { CapPixi } from "src/scenes/cap/CapPixi";

export default function Cap({ isPixi }: SceneProps) {
  const { setCanvasPointerEvents } = useSceneStore();

  useEffect(() => {
    setCanvasPointerEvents("auto");
  }, [setCanvasPointerEvents]);

  if (!isPixi) return null;

  return <CapPixi />;
}
