import { Graphics, Text, TextStyle } from "pixi.js";
import { extend } from "@pixi/react";
import { SVGParserGfx } from "./SVGParserGfx";
import { useSVGParserStore } from "./useSVGParserStore";
import useSceneSize from "src/utils/hooks/useSceneSize";
import { useState } from "react";

extend({ Graphics, Text });

type SVGParserPixiProps = {
  onButtonClick: () => void;
};

export function SVGParserPixi({ onButtonClick }: SVGParserPixiProps) {
  const { parsedSVG } = useSVGParserStore();
  const { width, height } = useSceneSize();
  const [isHovered, setIsHovered] = useState(false);

  if (parsedSVG) {
    return <SVGParserGfx parsedSVG={parsedSVG} />;
  }

  // Button dimensions and position
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonX = width / 2 - buttonWidth / 2;
  const buttonY = height / 2 - buttonHeight / 2;

  return (
    <>
      {/* Button background */}
      <pixiGraphics
        x={buttonX}
        y={buttonY}
        eventMode="static"
        cursor="pointer"
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={onButtonClick}
        draw={(g) => {
          g.clear();
          g.roundRect(0, 0, buttonWidth, buttonHeight, 8);
          g.fill({
            color: isHovered ? 0x45a049 : 0x4caf50,
            alpha: 1,
          });
        }}
      />

      {/* Button text */}
      <pixiText
        text="Load SVG File"
        x={width / 2}
        y={height / 2}
        anchor={{ x: 0.5, y: 0.5 }}
        style={
          new TextStyle({
            fontFamily: "Arial",
            fontSize: 18,
            fontWeight: "bold",
            fill: 0xffffff,
          })
        }
      />
    </>
  );
}
