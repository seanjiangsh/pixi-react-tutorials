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

type Point2D = { x: number; y: number };

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

export function generatePointsByEquation(
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
      x: Math.round(origin.x + p.x),
      y: Math.round(origin.y + p.y),
      tangent,
    };
  });
}

// Generate a circular path
export function generateCirclePath(params: {
  radius: number;
  segments?: number;
  origin?: Point2D;
}): GeneratedPoints {
  const { radius, segments = 100, origin = { x: 0, y: 0 } } = params;

  return generatePointsByEquation({
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
export function generateRoundedRectPath(params: {
  width: number;
  height: number;
  radius: number;
  segments?: number;
  origin?: Point2D;
}): GeneratedPoints {
  const {
    width,
    height,
    radius,
    segments = 200,
    origin = { x: 0, y: 0 },
  } = params;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Calculate segment lengths for horizontal and vertical sides
  const horizontalLength = 2 * (halfWidth - radius); // Top and bottom sides
  const verticalLength = 2 * (halfHeight - radius); // Left and right sides
  const arcLength = (Math.PI / 2) * radius;
  const bottomSideLength = horizontalLength + arcLength;
  const leftSideLength = verticalLength + arcLength;
  const topSideLength = horizontalLength + arcLength;
  const rightSideLength = verticalLength + arcLength;
  const totalLength =
    bottomSideLength + leftSideLength + topSideLength + rightSideLength;

  return generatePointsByEquation({
    origin,
    equation: (t: number) => {
      // Clamp t to valid range to avoid modulo issues at boundaries
      t = Math.max(0, Math.min(t, totalLength - 0.0001));

      // Determine which segment (0-3) and position within segment
      let segmentIndex = 0;
      let segmentT = t;

      if (t < bottomSideLength) {
        segmentIndex = 0;
        segmentT = t;
      } else if (t < bottomSideLength + leftSideLength) {
        segmentIndex = 1;
        segmentT = t - bottomSideLength;
      } else if (t < bottomSideLength + leftSideLength + topSideLength) {
        segmentIndex = 2;
        segmentT = t - bottomSideLength - leftSideLength;
      } else {
        segmentIndex = 3;
        segmentT = t - bottomSideLength - leftSideLength - topSideLength;
      }

      let x = 0,
        y = 0;

      if (segmentIndex === 0) {
        // Segment 0: Bottom side (right to left) + bottom-left corner
        if (segmentT <= horizontalLength) {
          // Straight part: from (halfWidth - radius, halfHeight) to (-halfWidth + radius, halfHeight)
          x = halfWidth - radius - segmentT;
          y = halfHeight;
        } else {
          // Arc part: bottom-left corner (center at -halfWidth + radius, halfHeight - radius)
          const arcProgress = (segmentT - horizontalLength) / arcLength;
          const angle = Math.PI / 2 + arcProgress * (Math.PI / 2); // 90° to 180° (counter-clockwise)
          x = -halfWidth + radius + radius * Math.cos(angle);
          y = halfHeight - radius + radius * Math.sin(angle);
        }
      } else if (segmentIndex === 1) {
        // Segment 1: Left side (bottom to top) + top-left corner
        if (segmentT <= verticalLength) {
          // Straight part: from (-halfWidth, halfHeight - radius) to (-halfWidth, -halfHeight + radius)
          x = -halfWidth;
          y = halfHeight - radius - segmentT;
        } else {
          // Arc part: top-left corner (center at -halfWidth + radius, -halfHeight + radius)
          const arcProgress = (segmentT - verticalLength) / arcLength;
          const angle = Math.PI + arcProgress * (Math.PI / 2); // 180° to 270° (counter-clockwise)
          x = -halfWidth + radius + radius * Math.cos(angle);
          y = -halfHeight + radius + radius * Math.sin(angle);
        }
      } else if (segmentIndex === 2) {
        // Segment 2: Top side (left to right) + top-right corner
        if (segmentT <= horizontalLength) {
          // Straight part: from (-halfWidth + radius, -halfHeight) to (halfWidth - radius, -halfHeight)
          x = -halfWidth + radius + segmentT;
          y = -halfHeight;
        } else {
          // Arc part: top-right corner (center at halfWidth - radius, -halfHeight + radius)
          const arcProgress = (segmentT - horizontalLength) / arcLength;
          const angle = (3 * Math.PI) / 2 + arcProgress * (Math.PI / 2); // 270° to 0° (counter-clockwise)
          x = halfWidth - radius + radius * Math.cos(angle);
          y = -halfHeight + radius + radius * Math.sin(angle);
        }
      } else {
        // Segment 3: Right side (top to bottom) + bottom-right corner
        if (segmentT <= verticalLength) {
          // Straight part: from (halfWidth, -halfHeight + radius) to (halfWidth, halfHeight - radius)
          x = halfWidth;
          y = -halfHeight + radius + segmentT;
        } else {
          // Arc part: bottom-right corner (center at halfWidth - radius, halfHeight - radius)
          const arcProgress = (segmentT - verticalLength) / arcLength;
          const angle = arcProgress * (Math.PI / 2); // 0° to 90° (counter-clockwise)
          x = halfWidth - radius + radius * Math.cos(angle);
          y = halfHeight - radius + radius * Math.sin(angle);
        }
      }

      return { x, y };
    },
    tStart: 0,
    tEnd: totalLength,
    segments,
    includeTangents: true,
  });
}
