import { SceneProps } from "src/scenes/Scenes";
import { GridBoardPixi } from "src/scenes/grid-board/GridBoardPixi";

export default function GridBoard({ isPixi }: SceneProps) {
  if (!isPixi) return null;

  return <GridBoardPixi />;
}
