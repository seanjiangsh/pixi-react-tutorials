import { Application, extend } from "@pixi/react";
import {
  Assets,
  Container,
  Sprite,
  Texture,
  FederatedPointerEvent,
  Rectangle,
} from "pixi.js";

import useSceneSize from "../../utils/useSceneSize";
import BluredText from "./BluredText";
import { useEffect, useState } from "react";
import { SceneProps } from "../sceneLoader";

// extend tells @pixi/react what Pixi.js components are available
extend({ Container, Sprite });

type BunnySpriteProps = {
  x: number;
  y: number;
};

function BunnySprite({ x, y }: BunnySpriteProps) {
  const [texture, setTexture] = useState(Texture.EMPTY);
  const [isActive, setIsActive] = useState(false);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("https://pixijs.com/assets/bunny.png").then((result) =>
        setTexture(result)
      );
    }
  }, [texture]);

  return (
    <pixiSprite
      anchor={0.5}
      eventMode={"static"}
      onClick={() => setIsActive(!isActive)}
      scale={isActive ? 1 : 1.5}
      texture={texture}
      x={x}
      y={y}
    />
  );
}

export default function HelloWorld({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();
  const [spritePosition, setSpritePosition] = useState({
    x: width / 2,
    y: height / 2,
  });
  const containerHitArea = new Rectangle(0, 0, width, height);
  const bluredTextProps = {
    text: "Hello World",
    x: width * 0.5,
    y: height * 0.75,
    fontSize: Math.sqrt(width * width + height * height) * 0.03,
  };

  const handlePointerMove = (e: FederatedPointerEvent) => {
    const { x, y } = e.global;
    setSpritePosition({ x, y });
  };

  return (
    <Application
      width={width}
      height={height}
      background={0x1099bb}
      resizeTo={containerRef}
    >
      <pixiContainer
        eventMode="static"
        hitArea={containerHitArea}
        onPointerMove={handlePointerMove}
      >
        <BunnySprite x={spritePosition.x} y={spritePosition.y} />
        <BluredText {...bluredTextProps} />
      </pixiContainer>
    </Application>
  );
}
