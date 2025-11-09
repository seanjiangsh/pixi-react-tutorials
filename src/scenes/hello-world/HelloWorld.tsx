import { Application, extend } from "@pixi/react";
import {
  Assets,
  Container,
  Sprite,
  Texture,
  FederatedPointerEvent,
} from "pixi.js";

import useSceneSize from "../../utils/useSceneSize";
import BluredText from "./BluredText";
import { useEffect, useRef, useState } from "react";
import { SceneProps } from "../sceneLoader";

// extend tells @pixi/react what Pixi.js components are available
extend({ Container, Sprite });

function BunnySprite() {
  // The Pixi.js `Sprite`
  const spriteRef = useRef(null);

  const [texture, setTexture] = useState(Texture.EMPTY);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("https://pixijs.com/assets/bunny.png").then((result) =>
        setTexture(result)
      );
    }
  }, [texture]);

  const handlePointerMove = (event: FederatedPointerEvent) => {
    const { x, y } = event.global;
    if (!isDragging) return;
    console.log("Moving to:", x, y);
    setPosition({ x, y });
  };

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <pixiSprite
      ref={spriteRef}
      anchor={0.5}
      eventMode={"static"}
      onClick={() => setIsActive(!isActive)}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerUpOutside={handlePointerUp}
      scale={isActive ? 1 : 1.5}
      texture={texture}
      x={position.x}
      y={position.y}
    />
  );
}

export default function HelloWorld({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();
  const bluredTextProps = {
    text: "Hello World",
    x: width * 0.275,
    y: height * 0.25,
    fontSize: Math.sqrt(width * width + height * height) * 0.03,
  };

  return (
    <Application
      width={width}
      height={height}
      background={0x1099bb}
      resizeTo={containerRef}
    >
      <BunnySprite />
      <pixiContainer x={width * 0.25} y={height * 0.33}>
        <BluredText {...bluredTextProps} />
      </pixiContainer>
    </Application>
  );
}
