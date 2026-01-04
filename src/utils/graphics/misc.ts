import { PointData } from "pixi.js";
import { memoize } from "./memoize";

type GeneratePointsByEquationParams = {
  origin?: PointData;
  equation: (t: number) => PointData;
  tStart?: number;
  tEnd: number;
  segments: number;
  includeTangents?: boolean;
  cacheKey?: unknown[]; // Additional values to include in cache key (e.g., closure variables)
};

export type GeneratedPoints = Array<
  PointData & { tangent: { dx: number; dy: number } }
>;

// Internal non-memoized implementation
function genPointsByEquationImpl(
  params: GeneratePointsByEquationParams
): GeneratedPoints {
  const origin = params.origin ?? { x: 0, y: 0 };
  const { equation, tStart = 0, tEnd, segments } = params;

  return Array.from({ length: segments }, (_, i) => {
    const t = tStart + ((tEnd - tStart) * i) / segments;
    const p = equation(t);
    const next = equation(t + (tEnd - tStart) / segments);
    const tangent = { dx: next.x - p.x, dy: next.y - p.y };

    return {
      x: origin.x + p.x,
      y: origin.y + p.y,
      tangent,
    };
  });
}

/**
 * Generate points along a parametric equation with memoization
 * Results are cached based on equation, origin, tStart, tEnd, segments, and cacheKey
 * Cache expires after 1 minute and keeps last 100 unique parameter sets
 * Uses precision=1 to round numbers to 1 decimal place for better cache hits during animations
 *
 * IMPORTANT: If your equation captures variables (closures), include them in cacheKey:
 * genPointsByEquation({ equation: (t) => ({ x: t, y: D * ... }), cacheKey: [D, w, m], ... })
 */
export const genPointsByEquation = memoize(genPointsByEquationImpl, {
  maxSize: 100,
  maxAge: 60000,
  precision: 1,
  keyGenerator: (args) => {
    const params = args[0] as GeneratePointsByEquationParams;
    const precision = 1;
    const multiplier = Math.pow(10, precision);

    // Round numbers in cacheKey to match precision
    const roundedCacheKey = params.cacheKey?.map((val) =>
      typeof val === "number" ? Math.round(val * multiplier) / multiplier : val
    );

    // Include cacheKey in the hash to capture closure variables
    return JSON.stringify([
      params.equation.toString(),
      params.origin,
      params.tStart !== undefined
        ? Math.round(params.tStart * multiplier) / multiplier
        : params.tStart,
      Math.round(params.tEnd * multiplier) / multiplier,
      params.segments,
      roundedCacheKey, // Include closure variables with rounding
    ]);
  },
});
// export const genPointsByEquation = genPointsByEquationImpl;

// Internal non-memoized implementation
function genHSLTransitionColorImpl(baseHue: number, brightness: number) {
  // Use HSL for smooth color transitions:
  // Low brightness (0-0.2): Deep brown/orange (30° hue, low lightness)
  // Medium brightness (0.2-0.8): Orange to yellow (30°-50° hue)
  // High brightness (0.8-1.0): Yellow to white (50° hue, high lightness)

  const hue = baseHue + brightness * 20; // 30° (brown/orange) to 50° (yellow)
  const saturation = Math.max(0.3, 1 - brightness * 0.5); // High saturation at low brightness
  const lightness = 0.2 + brightness * 0.6; // 0.2 (dark) to 0.8 (bright)
  const alpha = 0.2 + brightness * 0.8; // 0.2 to 1.0

  const color = `hsl(${hue}, ${saturation * 100}%, ${lightness * 100}%)`;
  return { color, alpha };
}

/**
 * Generate HSL color with smooth transitions based on brightness
 * Results are cached based on baseHue and brightness values
 * Useful for frequently generated colors in animations
 * Uses precision=2 for good cache hit rate while maintaining color accuracy
 */
export const genHSLTransitionColor = memoize(genHSLTransitionColorImpl, {
  maxSize: 200, // More cache space for color variations
  maxAge: 120000, // 2 minutes - colors are lightweight
  precision: 2, // Round to 2 decimal places for colors
});
