import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import type { Spotlight, AnimationPhase } from "./physics";
import type { CellCorners } from "./geometry";

extend({ Graphics });

type SpotlightLayerProps = {
  spotlights: Spotlight[];
  showDimming: boolean;
  animationPhase: AnimationPhase;
  assignedCells: number[];
  cellCornersCache: Map<number, CellCorners>;
  expandingStartTime: number;
  animationControls: {
    expandPause: number;
    expandDuration: number;
  };
};

export function SpotlightLayer({
  spotlights,
  showDimming,
  animationPhase,
  assignedCells,
  cellCornersCache,
  expandingStartTime,
  animationControls,
}: SpotlightLayerProps) {
  const drawSpotlights = (g: Graphics) => {
    g.clear();
    if (!showDimming) return;

    // Use erase blend mode to create holes in the dimming layer
    g.blendMode = "erase";

    spotlights.forEach((spotlight, index) => {
      g.setFillStyle({ color: 0xffffff, alpha: 1 });

      if (animationPhase === "expanding" || animationPhase === "complete") {
        // Get assigned cell for this spotlight
        const assignedCell = assignedCells[index];
        const cellCorners = cellCornersCache.get(assignedCell);

        if (cellCorners) {
          let progress = 1;
          if (animationPhase === "expanding") {
            // Calculate elapsed time specifically for expanding phase
            // If expandingStartTime is 0, we're just entering the phase, so start at 0
            if (expandingStartTime === 0) {
              progress = 0;
            } else {
              const expandingElapsedTime =
                (Date.now() - expandingStartTime) / 1000;
              const morphStart = animationControls.expandPause;
              const morphDuration = animationControls.expandDuration;
              const timeSinceMorphStart = Math.max(
                0,
                expandingElapsedTime - morphStart
              );
              progress = Math.min(1, timeSinceMorphStart / morphDuration);
            }
          }

          // Interpolate from circle to actual cell shape (trapezoid)
          const { topLeft, topRight, bottomRight, bottomLeft } = cellCorners;

          if (progress < 1) {
            // During morphing: move circle center to cell center and shrink radius
            const lerp = (start: number, end: number, t: number) =>
              start + (end - start) * t;

            // Interpolate position from spotlight to cell center
            const currentX = lerp(
              spotlight.position.x,
              cellCorners.center.x,
              progress
            );
            const currentY = lerp(
              spotlight.position.y,
              cellCorners.center.y,
              progress
            );
            // Shrink radius to smaller of cell width/height
            const targetRadius =
              Math.min(cellCorners.width, cellCorners.height) / 2;
            const currentRadius = lerp(
              spotlight.radius,
              targetRadius,
              progress
            );

            // Draw circle
            g.circle(currentX, currentY, currentRadius);
            g.fill();
          } else {
            // Fully expanded: draw exact cell shape
            g.moveTo(topLeft.x, topLeft.y);
            g.lineTo(topRight.x, topRight.y);
            g.lineTo(bottomRight.x, bottomRight.y);
            g.lineTo(bottomLeft.x, bottomLeft.y);
            g.closePath();
            g.fill();
          }
        } else {
          // Fallback to circle if no cell data
          g.circle(
            spotlight.position.x,
            spotlight.position.y,
            spotlight.radius
          );
          g.fill();
        }
      } else {
        // Searching and focusing phases: draw circles
        g.circle(spotlight.position.x, spotlight.position.y, spotlight.radius);
        g.fill();
      }
    });
  };

  return <pixiGraphics draw={drawSpotlights} />;
}
