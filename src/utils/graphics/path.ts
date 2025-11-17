import { type Point2D } from "src/types/types";
import { type GeneratedPoints } from "src/utils/graphics/misc";
import { genPointsByEquation } from "src/utils/graphics/misc";

// Utility functions for path calculations

// Generate a circular path
export function generateCirclePath(params: {
  radius: number;
  segments?: number;
  origin?: Point2D;
}): GeneratedPoints {
  const { radius, segments = 100, origin = { x: 0, y: 0 } } = params;

  return genPointsByEquation({
    origin,
    equation: (t: number) => ({
      x: radius * Math.cos(t),
      y: radius * Math.sin(t),
    }),
    tStart: 0,
    tEnd: Math.PI * 2,
    segments,
    includeTangents: true,
  });
}

// Generate a rounded rectangle path
type GenerateRoundedRectPathParams = {
  width: number;
  height: number;
  radius: number;
  segments?: number;
  origin?: Point2D;
};
export function generateRoundedRectPath(
  params: GenerateRoundedRectPathParams
): GeneratedPoints {
  const {
    width,
    height,
    radius,
    segments = 200,
    origin = { x: 0, y: 0 },
  } = params;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const straightH = halfWidth - radius;
  const straightV = halfHeight - radius;
  const arcLength = (Math.PI / 2) * radius;

  // Helper type for rounded rectangle sides
  type RectSide = {
    straightLength: number;
    arcLength: number;
    straightStart: Point2D;
    straightDir: Point2D; // Direction vector for straight part
    arcCenter: Point2D;
    arcStartAngle: number;
  };
  // Define the 4 sides (counter-clockwise from bottom-right)
  const sides: RectSide[] = [
    {
      // Bottom: right to left
      straightLength: 2 * straightH,
      arcLength,
      straightStart: { x: straightH, y: halfHeight },
      straightDir: { x: -1, y: 0 },
      arcCenter: { x: -straightH, y: straightV },
      arcStartAngle: Math.PI / 2,
    },
    {
      // Left: bottom to top
      straightLength: 2 * straightV,
      arcLength,
      straightStart: { x: -halfWidth, y: straightV },
      straightDir: { x: 0, y: -1 },
      arcCenter: { x: -straightH, y: -straightV },
      arcStartAngle: Math.PI,
    },
    {
      // Top: left to right
      straightLength: 2 * straightH,
      arcLength,
      straightStart: { x: -straightH, y: -halfHeight },
      straightDir: { x: 1, y: 0 },
      arcCenter: { x: straightH, y: -straightV },
      arcStartAngle: (3 * Math.PI) / 2,
    },
    {
      // Right: top to bottom
      straightLength: 2 * straightV,
      arcLength,
      straightStart: { x: halfWidth, y: -straightV },
      straightDir: { x: 0, y: 1 },
      arcCenter: { x: straightH, y: straightV },
      arcStartAngle: 0,
    },
  ];

  // Calculate cumulative lengths for each side
  const sideLengths = sides.map((s) => s.straightLength + s.arcLength);
  const cumulativeLengths = sideLengths.reduce(
    (acc, len) => [...acc, acc[acc.length - 1] + len],
    [0]
  );
  const totalLength = cumulativeLengths[cumulativeLengths.length - 1];

  return genPointsByEquation({
    origin,
    equation: (t: number) => {
      t = Math.max(0, Math.min(t, totalLength - 0.0001));

      // Find which side we're on
      let sideIndex = 0;
      for (let i = 0; i < sides.length; i++) {
        if (t < cumulativeLengths[i + 1]) {
          sideIndex = i;
          break;
        }
      }

      const sideT = t - cumulativeLengths[sideIndex];
      const side = sides[sideIndex];

      if (sideT <= side.straightLength) {
        // Straight part
        return {
          x: side.straightStart.x + side.straightDir.x * sideT,
          y: side.straightStart.y + side.straightDir.y * sideT,
        };
      } else {
        // Arc part
        const arcProgress = (sideT - side.straightLength) / side.arcLength;
        const angle = side.arcStartAngle + arcProgress * (Math.PI / 2);
        return {
          x: side.arcCenter.x + radius * Math.cos(angle),
          y: side.arcCenter.y + radius * Math.sin(angle),
        };
      }
    },
    tStart: 0,
    tEnd: totalLength,
    segments,
    includeTangents: true,
  });
}
