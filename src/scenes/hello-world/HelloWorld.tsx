import { useMemo } from "react";
import { BlurFilter, TextStyle } from "pixi.js";
import { Stage, Container, Sprite, Text } from "@pixi/react";

import useSceneSize from "../../utils/useSceneSize";

export default function HelloWorld() {
  const blurFilter = useMemo(() => new BlurFilter(2), []);
  const bunnyUrl = "https://pixijs.io/pixi-react/img/bunny.png";

  const { width, height } = useSceneSize();

  return (
    <Stage width={width} height={height} options={{ background: 0x1099bb }}>
      <Sprite image={bunnyUrl} anchor={0.5} x={width * 0.3} y={height * 0.4} />
      <Sprite image={bunnyUrl} anchor={0.5} x={width * 0.5} y={height * 0.45} />
      <Sprite image={bunnyUrl} anchor={0.5} x={width * 0.7} y={height * 0.4} />

      <Container x={width * 0.25} y={height * 0.33}>
        <Text
          text="Hello World"
          anchor={0.5}
          x={width * 0.275}
          y={height * 0.25}
          filters={[blurFilter]}
          style={
            new TextStyle({
              align: "center",
              fill: "0xffffff",
              // use Math.sqrt to scale the font size based on the diagonal size
              fontSize: Math.sqrt(width * width + height * height) * 0.03,
              letterSpacing: 10,
              dropShadow: true,
              dropShadowColor: "#E72264",
              dropShadowDistance: 6,
            })
          }
        />
      </Container>
    </Stage>
  );
}
