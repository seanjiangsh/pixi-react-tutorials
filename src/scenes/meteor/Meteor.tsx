import { Application, extend } from "@pixi/react";
import { Container } from "pixi.js";

import useSceneSize from "src/utils/useSceneSize";
import { SceneProps } from "src/scenes/sceneLoader";
import { MeteorGraphics } from "src/scenes/meteor/MeteorGraphics";

// extend tells @pixi/react what Pixi.js components are available
extend({ Container });

export default function Meteor({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();

  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  const startWidth = maxDimension * 1.1;
  const targetWidth = minDimension;

  return (
    <Application
      width={width}
      height={height}
      background={0x0a0e27}
      resizeTo={containerRef}
      antialias
    >
      <pixiContainer x={width / 2} y={height / 2}>
        <MeteorGraphics
          startWidth={startWidth}
          targetWidth={targetWidth}
          baseBlur={3}
          layers={8}
          screenWidth={width}
          screenHeight={height}
        />
      </pixiContainer>
    </Application>
  );
}
