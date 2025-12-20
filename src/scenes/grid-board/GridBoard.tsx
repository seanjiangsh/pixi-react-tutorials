import { useEffect } from "react";
import { SceneProps } from "src/scenes/Scenes";
import { useSceneStore } from "src/stores/useSceneStore";
import { GridBoardPixi } from "src/scenes/grid-board/GridBoardPixi";

export default function GridBoard({ isPixi }: SceneProps) {
  const { setCanvasPointerEvents } = useSceneStore();

  useEffect(() => {
    setCanvasPointerEvents("auto");
  }, [setCanvasPointerEvents]);

  if (!isPixi) return null;

  return <GridBoardPixi />;
}
