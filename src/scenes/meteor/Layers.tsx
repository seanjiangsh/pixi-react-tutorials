import { useCallback, useMemo } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import { KawaseBlurFilter } from "pixi-filters";

import { GeneratedPoints } from "./meteorUtils";

extend({ Graphics });

// Shared Layer Component for both circles and rectangles
type LayerProps = {
  color: number;
  alpha: number;
  blurStrength: number;
  draw: (g: Graphics) => void;
};

export function Layer(props: LayerProps) {
  const { color, alpha, blurStrength, draw } = props;

  const blurFilter = useMemo(
    () =>
      blurStrength > 0
        ? new KawaseBlurFilter({ strength: blurStrength, quality: 10 })
        : null,
    [blurStrength]
  );

  const drawGraphics = useCallback(
    (g: Graphics) => {
      g.clear();
      g.setFillStyle({ color, alpha });
      draw(g);
    },
    [color, alpha, draw]
  );

  const filters = blurFilter ? [blurFilter] : undefined;
  // return <pixiGraphics draw={drawGraphics} />;
  return <pixiGraphics draw={drawGraphics} filters={filters} />;
}

// Combined Meteor Layer (semicircle head + triangle tail in one graphic)
export type MeteorShapeLayerProps = {
  circleRadius: number;
  tailLength: number;
  color: number;
  alpha: number;
  blurStrength: number;
};

export function MeteorShapeLayer(props: MeteorShapeLayerProps) {
  const { circleRadius, tailLength, color, alpha, blurStrength } = props;

  const draw = useCallback(
    (g: Graphics) => {
      // Start from top of the semicircle
      g.moveTo(0, -circleRadius);

      // Draw the semicircle arc (right half) - clockwise from top to bottom
      g.arc(0, 0, circleRadius, -Math.PI / 2, Math.PI / 2, false);

      // Now at bottom of semicircle (0, circleRadius)
      // Draw tail triangle back
      g.lineTo(-tailLength, 0);

      // Complete the triangle back to top
      g.lineTo(0, -circleRadius);

      g.fill();
    },
    [circleRadius, tailLength]
  );

  return (
    <Layer
      color={color}
      alpha={alpha}
      blurStrength={blurStrength}
      draw={draw}
    />
  );
}

// Simple Points-Based Layer - draws meteor along a path defined by points
export type PointsBasedLayerProps = {
  points: GeneratedPoints;
  width: number;
  color: number;
  alpha: number;
  blurStrength: number;
  lengthRatio?: number; // 0-1, how much of the points array to use
};

export function PointsBasedLayer(props: PointsBasedLayerProps) {
  const { points, width, color, alpha, blurStrength, lengthRatio = 1 } = props;
  const endRatio = 0.1;

  // Calculate how many points to use based on lengthRatio
  const usedPoints = useMemo(() => {
    const numPoints = Math.max(2, Math.floor(points.length * lengthRatio));
    return points.slice(0, numPoints);
  }, [points, lengthRatio]);

  const draw = useCallback(
    (g: Graphics) => {
      if (usedPoints.length < 2) return;

      const firstPoint = usedPoints[0];
      const angle = Math.atan2(firstPoint.tangent.dy, firstPoint.tangent.dx);

      // Starting width (full width at head)
      const headWidth = width;

      // Start at the top edge of the head
      const perpAngle = angle + Math.PI / 2;
      g.moveTo(
        firstPoint.x + Math.cos(perpAngle) * headWidth,
        firstPoint.y + Math.sin(perpAngle) * headWidth
      );

      // Draw a rounded cap at the head (semicircle)
      g.arc(
        firstPoint.x,
        firstPoint.y,
        headWidth,
        perpAngle,
        perpAngle + Math.PI,
        false
      );

      // Helper to get perpendicular offset for a point
      const getPerpendicularOffset = (
        point: (typeof usedPoints)[number],
        index: number
      ) => {
        const { dx, dy } = point.tangent;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const progress = index / (usedPoints.length - 1);
        const currentWidth = width * (1 - progress * (1 - endRatio));
        return {
          perpX: (-dy / len) * currentWidth,
          perpY: (dx / len) * currentWidth,
        };
      };

      // Draw along one side of the body (starting from bottom of head)
      for (let i = 1; i < usedPoints.length; i++) {
        const curr = usedPoints[i];
        const { perpX, perpY } = getPerpendicularOffset(curr, i);
        g.lineTo(curr.x - perpX, curr.y - perpY);
      }

      // Draw back along the other side
      for (let i = usedPoints.length - 1; i >= 1; i--) {
        const curr = usedPoints[i];
        const { perpX, perpY } = getPerpendicularOffset(curr, i);
        g.lineTo(curr.x + perpX, curr.y + perpY);
      }

      g.closePath();
      g.fill();
    },
    [usedPoints, width]
  );

  return (
    <Layer
      color={color}
      alpha={alpha}
      blurStrength={blurStrength}
      draw={draw}
    />
  );
}
