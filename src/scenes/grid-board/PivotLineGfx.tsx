import { useCallback } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";

extend({ Graphics });

interface PivotLineGfxProps {
  boardWidth: number;
  pivotY: number;
  alpha?: number;
}

/**
 * Renders a dashed horizontal line to visualize the perspective pivot point.
 */
export function PivotLineGfx(props: PivotLineGfxProps) {
  const { boardWidth, pivotY, alpha = 0.7 } = props;

  const drawPivotLine = useCallback(
    (g: Graphics) => {
      g.clear();

      const dash = 14;
      const gap = 8;

      g.setStrokeStyle({ width: 2, color: 0xffc107 });

      for (let x = 0; x < boardWidth; x += dash + gap) {
        g.moveTo(x, pivotY);
        g.lineTo(Math.min(x + dash, boardWidth), pivotY);
      }

      g.stroke();
    },
    [boardWidth, pivotY]
  );

  return <pixiGraphics draw={drawPivotLine} alpha={alpha} />;
}
