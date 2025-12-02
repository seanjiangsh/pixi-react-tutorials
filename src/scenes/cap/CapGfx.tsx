import { useCallback, useMemo } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";

import { genPointsByEquation } from "src/utils/graphics/misc";

extend({ Graphics });

type ColorStop = {
  stop: number;
  color: string;
};

type ColorConfig = {
  gradient: ColorStop[];
  stroke: string;
};

const colorConfigs: Record<string, ColorConfig> = {
  g: {
    gradient: [
      { stop: 0, color: "#000000" },
      { stop: 0.43, color: "#090E0B" },
      { stop: 1, color: "#1D3A2C" },
    ],
    stroke: "#1D3A2C",
  },
  y: {
    gradient: [
      { stop: 0, color: "#000000" },
      { stop: 0.43, color: "#090E0B" },
      { stop: 1, color: "#503516" },
    ],
    stroke: "#503516",
  },
  r: {
    gradient: [
      { stop: 0, color: "#000000" },
      { stop: 0.43, color: "#0E090A" },
      { stop: 1, color: "#520808" },
    ],
    stroke: "#520808",
  },
};

type CapGfxProps = {
  D: number;
  w: number;
  m: number;
  tRange: number;
  color: string;
};

export function CapGfx({ D, w, m, tRange, color }: CapGfxProps) {
  console.log("CapGfx params:", { D, w, m, tRange, color });
  // Generate cap path using parametric equations
  const capPath = useMemo(() => {
    const range = w * tRange;

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
      segments: 500,
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
  }, [D, w, m, tRange]);

  // Get color configuration
  const colorConfig = useMemo(() => {
    return colorConfigs[color] || colorConfigs.g;
  }, [color]);

  // Create gradient layers by interpolating between color stops
  const gradientLayers = useMemo(() => {
    const layers: Array<{
      color: string;
      alpha: number;
    }> = [];
    const steps = 50; // Number of gradient layers

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1); // 0 to 1

      // Find which color stops this t is between
      let startStop = colorConfig.gradient[0];
      let endStop = colorConfig.gradient[1];

      for (let j = 0; j < colorConfig.gradient.length - 1; j++) {
        if (
          t >= colorConfig.gradient[j].stop &&
          t <= colorConfig.gradient[j + 1].stop
        ) {
          startStop = colorConfig.gradient[j];
          endStop = colorConfig.gradient[j + 1];
          break;
        }
      }

      // Interpolate between the two color stops
      const localT = (t - startStop.stop) / (endStop.stop - startStop.stop);
      const interpolatedColor = interpolateColor(
        startStop.color,
        endStop.color,
        localT
      );

      layers.push({
        color: interpolatedColor,
        alpha: 1 / steps, // Blend layers together
      });
    }

    return layers;
  }, [colorConfig]);

  const drawCapStroke = useCallback(
    (g: Graphics) => {
      g.clear();

      g.setStrokeStyle({ color: colorConfig.stroke, width: 2 });

      if (capPath.length === 0) return;

      g.moveTo(capPath[0].x, capPath[0].y);

      for (let i = 1; i < capPath.length; i++) {
        g.lineTo(capPath[i].x, capPath[i].y);
      }

      g.closePath();
      g.stroke();
    },
    [capPath, colorConfig]
  );

  return (
    <>
      {/* Draw gradient layers */}
      {gradientLayers.map((layer, index) => (
        <CapLayer
          key={index}
          capPath={capPath}
          color={layer.color}
          alpha={layer.alpha}
        />
      ))}
      {/* Draw stroke on top */}
      <pixiGraphics draw={drawCapStroke} />
    </>
  );
}

// Helper component to draw a single gradient layer
type CapLayerProps = {
  capPath: Array<{ x: number; y: number }>;
  color: string;
  alpha: number;
};

function CapLayer({ capPath, color, alpha }: CapLayerProps) {
  const drawLayer = useCallback(
    (g: Graphics) => {
      g.clear();
      g.setFillStyle({ color, alpha });

      // Draw the closed cap path
      if (capPath.length === 0) return;

      g.moveTo(capPath[0].x, capPath[0].y);

      for (let i = 1; i < capPath.length; i++) {
        g.lineTo(capPath[i].x, capPath[i].y);
      }

      g.closePath();
      g.fill();
    },
    [capPath, color, alpha]
  );

  return <pixiGraphics draw={drawLayer} />;
}

// Helper function to interpolate between two hex colors
function interpolateColor(color1: string, color2: string, t: number): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
