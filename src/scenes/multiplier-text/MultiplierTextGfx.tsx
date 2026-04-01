import { useCallback, useMemo } from "react";
import { Text, BitmapText, Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import * as PIXI from "pixi.js";

extend({ Text, BitmapText, Graphics });

type MultiplierTextGfxProps = {
  x: number;
  y: number;
  currentValue: number;
  opacity: number;
  fontSize: number;
  textColor: string;
  effect: string;
  cellSize?: number;
};

export function MultiplierTextGfx(props: MultiplierTextGfxProps) {
  const { x, y, currentValue } = props;
  const { fontSize, textColor, opacity, cellSize = 0 } = props;
  const displayText = `X${Math.floor(currentValue).toString()}`;

  const textStyle = useMemo(() => {
    const style: Partial<PIXI.TextStyle> = {
      fontFamily: "Lucida Console",
      fontSize: fontSize,
      fontWeight: "bold",
      fill: textColor,
      align: "right",
      dropShadow: {
        alpha: 0.8,
        angle: 0,
        blur: 15,
        color: textColor,
        distance: 0,
      },
    };

    return style;
  }, [fontSize, textColor]);

  // Draw cell border for reference
  const drawCell = useCallback(
    (g: PIXI.Graphics) => {
      if (cellSize > 0) {
        g.clear();
        g.rect(-cellSize / 2, -cellSize / 2, cellSize, cellSize);
        g.stroke({ width: 2, color: 0xffd700, alpha: 0.5 });
      }
    },
    [cellSize]
  );

  return (
    <>
      {cellSize > 0 && <pixiGraphics x={x} y={y} draw={drawCell} />}
      <pixiBitmapText
        text={displayText}
        x={x}
        y={y}
        anchor={0.5}
        alpha={opacity}
        style={textStyle}
      />
    </>
  );
}
