import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import type { AnimationPhase } from "./physics";
import type { CellCorners } from "./geometry";

extend({ Graphics });

type CellRevealLayerProps = {
  showDimming: boolean;
  animationPhase: AnimationPhase;
  assignedCells: number[];
  cellCornersCache: Map<number, CellCorners>;
  focusStartTime: number;
  revealDuration?: number;
};

export function CellRevealLayer({
  showDimming,
  animationPhase,
  assignedCells,
  cellCornersCache,
  focusStartTime,
  revealDuration = 0.8,
}: CellRevealLayerProps) {
  const drawCellReveals = (g: Graphics) => {
    g.clear();
    if (!showDimming) return;

    // Only reveal during focusing, expanding, and complete phases
    if (
      animationPhase !== "focusing" &&
      animationPhase !== "expanding" &&
      animationPhase !== "complete"
    ) {
      return;
    }

    // Calculate reveal progress based on time since focusing started
    let revealProgress = 0;
    if (focusStartTime > 0) {
      const elapsed = (Date.now() - focusStartTime) / 1000;
      revealProgress = Math.min(1, elapsed / revealDuration);
    }

    // Use erase blend mode to remove dimming from cells
    g.blendMode = "erase";

    // Draw each assigned cell with increasing opacity to gradually erase dimming
    assignedCells.forEach((cellIndex) => {
      const cellCorners = cellCornersCache.get(cellIndex);
      if (!cellCorners) return;

      const { topLeft, topRight, bottomRight, bottomLeft } = cellCorners;

      g.setFillStyle({ color: 0xffffff, alpha: revealProgress });
      g.moveTo(topLeft.x, topLeft.y);
      g.lineTo(topRight.x, topRight.y);
      g.lineTo(bottomRight.x, bottomRight.y);
      g.lineTo(bottomLeft.x, bottomLeft.y);
      g.closePath();
      g.fill();
    });
  };

  return <pixiGraphics draw={drawCellReveals} />;
}
