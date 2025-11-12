// Utility functions for meteor calculations

export function calculateColor(brightness: number): {
  color: number;
  alpha: number;
} {
  let red: number, green: number, blue: number, alpha: number;

  if (brightness >= 0.8) {
    // High brightness (0.8 - 1.0): Close to white
    // Interpolate from yellowish-white to pure white
    const t = (brightness - 0.8) / 0.2; // 0 to 1
    red = Math.floor(255);
    green = Math.floor(245 + 10 * t); // 245 to 255
    blue = Math.floor(200 + 55 * t); // 200 to 255
    alpha = 0.9 + 0.1 * t; // 0.9 to 1.0
  } else if (brightness >= 0.5) {
    // Medium-high brightness (0.5 - 0.8): Yellowish
    const t = (brightness - 0.5) / 0.3; // 0 to 1
    red = Math.floor(255);
    green = Math.floor(200 + 45 * t); // 200 to 245
    blue = Math.floor(100 + 100 * t); // 100 to 200
    alpha = 0.7 + 0.2 * t; // 0.7 to 0.9
  } else if (brightness >= 0.2) {
    // Medium-low brightness (0.2 - 0.5): Orange to brownish
    const t = (brightness - 0.2) / 0.3; // 0 to 1
    red = Math.floor(200 + 55 * t); // 200 to 255
    green = Math.floor(100 + 100 * t); // 100 to 200
    blue = Math.floor(30 + 70 * t); // 30 to 100
    alpha = 0.4 + 0.3 * t; // 0.4 to 0.7
  } else {
    // Low brightness (0 - 0.2): Brownish with high opacity
    const t = brightness / 0.2; // 0 to 1
    red = Math.floor(120 + 80 * t); // 120 to 200
    green = Math.floor(50 + 50 * t); // 50 to 100
    blue = Math.floor(20 + 10 * t); // 20 to 30
    alpha = 0.2 + 0.2 * t; // 0.2 to 0.4 (high opacity at low brightness)
  }

  const color = (red << 16) | (green << 8) | blue;
  return { color, alpha };
}

type GeneratePointsByEquationParams = {
  startPoint: { x: number; y: number };
  equation: (t: number) => { x: number; y: number };
  length: number;
  segments: number;
};

export function generatePointsByEquation(
  params: GeneratePointsByEquationParams
): Array<{ x: number; y: number }> {
  const { startPoint, equation, length, segments } = params;
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = (i / segments) * length;
    const { x, y } = equation(t);
    return {
      x: Math.round(startPoint.x + x),
      y: Math.round(startPoint.y + y),
    };
  });
}
