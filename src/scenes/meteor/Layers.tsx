import { useCallback, useMemo } from "react";
import { Graphics } from "pixi.js";

import { type GeneratedPoints } from "src/utils/graphics/misc";
import { type ColorAlpha } from "src/types/types";
import { BlurGfx } from "src/utils/graphics/draws";

// Combined Meteor BlurGfx (semicircle head + triangle tail in one graphic)
export type MeteorShapeLayerProps = ColorAlpha & {
  circleRadius: number;
  tailLength: number;
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
    <BlurGfx
      color={color}
      alpha={alpha}
      blurStrength={blurStrength}
      draw={draw}
    />
  );
}

// Path Fill BlurGfx - fills the area enclosed by path with dim color and optional border
export type PathFillLayerProps = {
  points: GeneratedPoints;
  fill: ColorAlpha;
  border?: ColorAlpha & {
    width: number;
    blur?: number;
  };
};

export function PathFillLayer(props: PathFillLayerProps) {
  const { points, fill, border } = props;

  // Draw fill area
  const drawFill = useCallback(
    (g: Graphics) => {
      if (points.length < 3) return;

      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
      }
      g.closePath();
      g.fill();
    },
    [points]
  );

  // Draw border if specified
  const drawBorder = useCallback(
    (g: Graphics) => {
      if (points.length < 3 || !border) return;

      g.setStrokeStyle({
        color: border.color,
        alpha: border.alpha,
        width: border.width,
      });
      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
      }
      g.closePath();
      g.stroke();
    },
    [points, border]
  );

  return (
    <>
      {/* Fill layer */}
      <BlurGfx
        color={fill.color}
        alpha={fill.alpha}
        blurStrength={0}
        draw={drawFill}
      />
      {/* Border layer with optional blur */}
      {border && (
        <BlurGfx
          color={border.color}
          alpha={border.alpha}
          blurStrength={border.blur || 0}
          draw={drawBorder}
        />
      )}
    </>
  );
}

// Simple Points-Based BlurGfx - draws meteor along a path defined by points
export type PointsBasedLayerProps = ColorAlpha & {
  points: GeneratedPoints;
  width: number;
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
    <BlurGfx
      color={color}
      alpha={alpha}
      blurStrength={blurStrength}
      draw={draw}
    />
  );
}
