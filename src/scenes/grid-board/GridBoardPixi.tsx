import useSceneSize from "src/utils/hooks/useSceneSize";
import { GridBoardGfx } from "src/scenes/grid-board/GridBoardGfx";

export function GridBoardPixi() {
  const { width, height } = useSceneSize();

  return (
    <pixiContainer x={width / 2} y={height / 2} width={width} height={height}>
      <GridBoardGfx />
    </pixiContainer>
  );
}
