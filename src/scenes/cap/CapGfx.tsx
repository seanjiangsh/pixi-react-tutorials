import { useCallback, useMemo } from "react";
import { GradientOptions, Graphics, BlurFilter } from "pixi.js";
import { extend } from "@pixi/react";
import { useControls } from "leva";

import { genPointsByEquation } from "src/utils/graphics/misc";
import { capFillControls, capFilterControls } from "./capControls";
import { ManagedGraphics } from "src/utils/graphics/ManagedGraphics";

extend({ Graphics });

type CapGfxProps = {
  D: number;
  w: number;
  m: number;
  yThreshold?: number; // Threshold for y value to stop (default: D * 0.01)
};

export function CapGfx({ D, w, m, yThreshold = D * 0.01 }: CapGfxProps) {
  const { gradientColor1, gradientColor2 } = useControls(
    "Fill",
    capFillControls
  );
  const { blurAmount } = useControls("Filters", capFilterControls);

  // Generate cap path using parametric equations
  // console.log(
  //   "Rendering CapGfx with D:",
  //   D,
  //   "w:",
  //   w,
  //   "m:",
  //   m,
  //   "yThreshold:",
  //   yThreshold
  // );
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
      cacheKey: [D, w, m], // Include closure variables for proper caching
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

  const gradientConfig: GradientOptions = useMemo(
    () => ({
      type: "linear" as const,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops: [
        { offset: 0, color: gradientColor1 },
        { offset: 1, color: gradientColor2 },
      ],
      textureSpace: "local" as const,
    }),
    [gradientColor1, gradientColor2]
  );

  const filters = useMemo(
    () =>
      blurAmount > 0
        ? [{ filterClass: BlurFilter, options: { strength: blurAmount } }]
        : undefined,
    [blurAmount]
  );

  return (
    <>
      {/* Draw fill with managed gradient and filters */}
      <ManagedGraphics
        draw={drawCapFill}
        gradient={gradientConfig}
        filters={filters}
      />
      {/* Draw stroke on top */}
      <pixiGraphics draw={drawCapStroke} />
    </>
  );
}
