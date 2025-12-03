import { useCallback, useMemo } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";

import { genPointsByEquation } from "src/utils/graphics/misc";

extend({ Graphics });

type CapGfxProps = {
  D: number;
  w: number;
  m: number;
  yThreshold?: number; // Threshold for y value to stop (default: D * 0.01)
};

export function CapGfx({ D, w, m, yThreshold = D * 0.01 }: CapGfxProps) {
  // Generate cap path using parametric equations
  const capPath = useMemo(() => {
    // Find the t value where y drops below threshold
    // y(t) = D * e^(- (t^2/w^2)^m) < yThreshold
    // Solve for t: t = w * ((-ln(yThreshold/D))^(1/m))^(1/2)
    const threshold = yThreshold || D * 0.01;
    const range = 2 * w * Math.pow(-Math.log(threshold / D), 1 / (2 * m));

    // Generate cap curve using parametric equation
    // x(t) = t
    // y(t) = D * e^(- (t^2/w^2)^m)  (inverted to point upward)
    const curvePoints = genPointsByEquation({
      equation: (t) => ({
        x: t,
        y: D * Math.exp(-Math.pow((t * t) / (w * w), m)),
      }),
      tStart: -range / 2,
      tEnd: range / 2,
      segments: 200,
    });

    // Close the path by adding bottom points
    const closedPath = [
      ...curvePoints,
      {
        x: curvePoints[curvePoints.length - 1].x,
        y: 0,
        tangent: { dx: 0, dy: 0 },
      },
      { x: curvePoints[0].x, y: 0, tangent: { dx: 0, dy: 0 } },
    ];

    return closedPath;
  }, [D, w, m, yThreshold]);

  const drawCapFill = useCallback(
    (g: Graphics) => {
      g.clear();
      g.setFillStyle({ color: 0x1a3a2a }); // Darker green fill

      if (capPath.length === 0) return;

      g.moveTo(capPath[0].x, capPath[0].y);

      for (let i = 1; i < capPath.length; i++) {
        g.lineTo(capPath[i].x, capPath[i].y);
      }

      g.closePath();
      g.fill();
    },
    [capPath]
  );

  const drawCapStroke = useCallback(
    (g: Graphics) => {
      g.clear();
      g.setStrokeStyle({ color: 0x2ecc71, width: 2 }); // Bright green stroke

      if (capPath.length === 0) return;

      g.moveTo(capPath[0].x, capPath[0].y);

      for (let i = 1; i < capPath.length; i++) {
        g.lineTo(capPath[i].x, capPath[i].y);
      }

      g.closePath();
      g.stroke();
    },
    [capPath]
  );

  return (
    <>
      {/* Draw fill */}
      <pixiGraphics draw={drawCapFill} />
      {/* Draw stroke on top */}
      <pixiGraphics draw={drawCapStroke} />
    </>
  );
}
