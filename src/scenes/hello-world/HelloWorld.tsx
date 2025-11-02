import { Application, extend } from "@pixi/react";
import { Assets, Container, Sprite, Texture } from "pixi.js";

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
  const [isHovered, setIsHover] = useState(false);
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
      ref={spriteRef}
      anchor={0.5}
      eventMode={"static"}
      onClick={() => setIsActive(!isActive)}
      onPointerOver={() => setIsHover(true)}
      onPointerOut={() => setIsHover(false)}
      scale={isActive ? 1 : 1.5}
      texture={texture}
      x={100}
      y={100}
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
