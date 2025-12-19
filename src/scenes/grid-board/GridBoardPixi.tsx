import { useControls } from "leva";
import useSceneSize from "src/utils/hooks/useSceneSize";
import { GridBoardGfx } from "./GridBoardGfx copy";
import { GridBoardGfx_svgPathdata } from "src/scenes/grid-board/GridBoardGfx_svg-pathdata";

export function GridBoardPixi() {
  const { width, height } = useSceneSize();

  return (
    <pixiContainer x={width / 2} y={height / 2} width={width} height={height}>
      {/* <GridBoardGfx /> */}
      <GridBoardGfx_svgPathdata />
    </pixiContainer>
  );
}
