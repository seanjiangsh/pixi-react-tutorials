import { useEffect, useState } from "react";
import { extend } from "@pixi/react";
import {
  Assets,
  Container,
  Sprite,
  Texture,
  FederatedPointerEvent,
  Rectangle,
} from "pixi.js";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { SceneProps } from "src/scenes/Scenes";
import BluredText from "src/scenes/hello-world/BluredText";

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
    if (texture !== Texture.EMPTY) return;
    Assets.load("https://pixijs.com/assets/bunny.png").then((result) =>
      setTexture(result)
    );
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

export default function HelloWorld({ isPixi }: SceneProps) {
  const { width, height } = useSceneSize();

  const [spritePosition, setSpritePosition] = useState({
    x: width / 2,
    y: height / 2,
  });

  if (!isPixi) return null;
  const containerHitArea = new Rectangle(0, 0, width, height);
  const bluredTextProps = {
    text: "Hello World",
    x: width * 0.5,
    y: height * 0.75,
    fontSize: Math.sqrt(width * width + height * height) * 0.03,
  };

  const handlePointerMove = (e: FederatedPointerEvent) => {
    const { x, y } = e.global;
    // console.log(`Pointer moved to x:${x}, y:${y}`);
    setSpritePosition({ x, y });
  };

  return (
    <pixiContainer
      eventMode="static"
      // interactive={true}
      hitArea={containerHitArea}
      onPointerMove={handlePointerMove}
      onPointerDown={() => console.log("Pointer down on pixi container")}
      onClick={() => console.log("Click on pixi container")}
      width={width}
      height={height}
    >
      <BunnySprite x={spritePosition.x} y={spritePosition.y} />
      <BluredText {...bluredTextProps} />
    </pixiContainer>
  );
}
