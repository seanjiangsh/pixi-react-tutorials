import { useEffect } from "react";
import { SceneProps } from "src/scenes/Scenes";
import { SpotlightDOM } from "src/scenes/spotlight/SpotlightDOM";
import { SpotlightPixi } from "src/scenes/spotlight/SpotlightPixi";
import { useSceneStore } from "src/stores/useSceneStore";

export default function Spotlight({ isPixi }: SceneProps) {
  // Set canvas pointer-events to none for DOM interactions
  useEffect(() => {
    const { setCanvasPointerEvents } = useSceneStore.getState();
    setCanvasPointerEvents("none");
    return () => setCanvasPointerEvents("auto");
  }, []);
  if (isPixi) {
    return <SpotlightPixi />;
  } else {
    return <SpotlightDOM />;
  }
}
