import { useCallback } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import type { BoardBounds } from "./geometry";

extend({ Graphics });

type DimmingLayerProps = {
  showDimming: boolean;
  boardBounds: BoardBounds | null;
  opacity: number;
};

export function DimmingLayer({
  showDimming,
  boardBounds,
  opacity,
}: DimmingLayerProps) {
  const drawDimming = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!showDimming || !boardBounds) return;

      const { topLeft, topRight, bottomRight, bottomLeft } = boardBounds;

      // Extend right and bottom edges to compensate for 3D transform
      const extendRight = 2;
      const extendBottom = 2;

      // Draw polygon covering the board
      g.setFillStyle({ color: 0x000000, alpha: opacity });
      g.moveTo(topLeft.x, topLeft.y);
      g.lineTo(topRight.x + extendRight, topRight.y);
      g.lineTo(bottomRight.x + extendRight, bottomRight.y + extendBottom);
      g.lineTo(bottomLeft.x, bottomLeft.y + extendBottom);
      g.closePath();
      g.fill();
    },
    [showDimming, boardBounds, opacity]
  );

  return <pixiGraphics draw={drawDimming} />;
}
