import { Stage, Container, Sprite } from "@pixi/react";

import useSceneSize from "../../utils/useSceneSize";
import BluredText from "./BluredText";

export default function HelloWorld() {
  const bunnyUrl = "https://pixijs.io/pixi-react/img/bunny.png";

  const { width, height } = useSceneSize();
  const bluredTextProps = {
    text: "Hello World",
    x: width * 0.275,
    y: height * 0.25,
    fontSize: Math.sqrt(width * width + height * height) * 0.03,
  };

  return (
    <Stage width={width} height={height} options={{ background: 0x1099bb }}>
      <Sprite image={bunnyUrl} anchor={0.5} x={width * 0.3} y={height * 0.4} />
      <Sprite image={bunnyUrl} anchor={0.5} x={width * 0.5} y={height * 0.45} />
      <Sprite image={bunnyUrl} anchor={0.5} x={width * 0.7} y={height * 0.4} />

      <Container x={width * 0.25} y={height * 0.33}>
        <BluredText {...bluredTextProps} />
      </Container>
    </Stage>
  );
}
