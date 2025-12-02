import { Point2D } from "src/types/types";

type GeneratePointsByEquationParams = {
  origin?: Point2D;
  equation: (t: number) => Point2D;
  tStart?: number;
  tEnd: number;
  segments: number;
  includeTangents?: boolean;
};

export type GeneratedPoints = Array<
  Point2D & { tangent: { dx: number; dy: number } }
>;

export function genPointsByEquation(
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

export function genHSLTransitionColor(baseHue: number, brightness: number) {
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
