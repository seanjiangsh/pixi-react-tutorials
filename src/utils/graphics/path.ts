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

// Generate a lightning bolt path
type GenerateLightningPathParams = {
  start: Point2D;
  end: Point2D;
  displacement?: number; // Maximum perpendicular displacement for zigzag effect
  jaggedness?: number; // Controls how "jagged" the lightning is (0-1)
  seed?: number; // Seed for reproducible randomness
  segmentDensity?: number; // Points per unit length (higher = more detail)
  envelopeShape?: number; // Envelope curve power (1 = sine, >1 = sharper taper)
  smoothingIterations?: number; // Number of smoothing passes (overrides jaggedness)
};

export function generateLightningPath(
  params: GenerateLightningPathParams
): Point2D[] {
  const { start, end } = params;
  const { displacement = 50, jaggedness = 0.5, seed = Math.random() } = params;
  const {
    segmentDensity = 12,
    envelopeShape = 1,
    smoothingIterations,
  } = params;

  // Seeded random generator (linear congruential)
  let seedValue = Math.floor(seed as number) || 1;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  // Line vector and perpendicular
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / length;
  const dirY = dy / length;
  const perpX = -dirY;
  const perpY = dirX;

  // Determine number of sample segments based on density and length
  const rawSegments = Math.max(4, Math.round(length / segmentDensity));
  const numSegments = Math.min(200, rawSegments);

  // Generate random peak heights for each sample point (endpoints zero)
  const heights: number[] = new Array(numSegments + 1).fill(0);
  for (let i = 1; i < numSegments; i++) {
    // random in -1..1
    heights[i] = (seededRandom() * 2 - 1) * displacement;
  }

  // Smooth heights: use explicit iterations if provided, else derive from jaggedness
  const smoothPasses =
    smoothingIterations !== undefined
      ? smoothingIterations
      : Math.max(0, Math.round((1 - jaggedness) * 5));

  for (let iter = 0; iter < smoothPasses; iter++) {
    const temp = heights.slice();
    for (let i = 1; i < numSegments; i++) {
      temp[i] = (heights[i - 1] + heights[i] + heights[i + 1]) / 3;
    }
    for (let i = 1; i < numSegments; i++) heights[i] = temp[i];
  }

  // Apply an envelope so displacements taper near endpoints (no crossing head/tail)
  const points: Point2D[] = [];
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments; // 0..1
    const baseX = start.x + dirX * length * t;
    const baseY = start.y + dirY * length * t;

    // Envelope: shaped by envelopeShape parameter
    // envelopeShape = 1: sine wave (smooth)
    // envelopeShape > 1: sharper peak in middle
    // envelopeShape < 1: flatter curve
    const envelope = Math.pow(Math.sin(Math.PI * t), envelopeShape);

    const offset = heights[i] * envelope;

    const px = baseX + perpX * offset;
    const py = baseY + perpY * offset;

    points.push({ x: px, y: py });
  }

  return points;
}

// Generate lightning with branches
type GenerateLightningWithBranchesParams = GenerateLightningPathParams & {
  branchProbability?: number; // Probability of branching at each point (0-1)
  branchLength?: number; // Relative length of branches (0-1)
};

export type LightningBolt = {
  main: Point2D[];
  branches: Point2D[][];
};

export function generateLightningWithBranches(
  params: GenerateLightningWithBranchesParams
): LightningBolt {
  const { start, end, displacement = 50 } = params;
  const { branchProbability = 0.3, branchLength = 0.5 } = params;
  const { jaggedness = 0.5, seed = Math.random() } = params;

  // Generate main bolt
  const mainBolt = generateLightningPath({
    start,
    end,
    displacement,
    jaggedness,
    seed,
  });

  const branches: Point2D[][] = [];

  // Simple seeded random for branches
  let seedValue = seed * 1.5;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  // Generate branches from points along the main bolt
  // Skip first and last few points
  const startIdx = Math.floor(mainBolt.length * 0.2);
  const endIdx = Math.floor(mainBolt.length * 0.8);

  for (let i = startIdx; i < endIdx; i++) {
    if (seededRandom() < branchProbability) {
      const branchStart = mainBolt[i];

      // Calculate branch direction (perpendicular + forward)
      const nextPoint = mainBolt[Math.min(i + 1, mainBolt.length - 1)];
      const dx = nextPoint.x - branchStart.x;
      const dy = nextPoint.y - branchStart.y;

      // Branch goes sideways and forward
      const angle = seededRandom() > 0.5 ? Math.PI / 3 : -Math.PI / 3;
      const branchEnd: Point2D = {
        x:
          branchStart.x +
          (dx * Math.cos(angle) - dy * Math.sin(angle)) * branchLength * 5,
        y:
          branchStart.y +
          (dx * Math.sin(angle) + dy * Math.cos(angle)) * branchLength * 5,
      };

      const branch = generateLightningPath({
        start: branchStart,
        end: branchEnd,
        displacement: displacement * branchLength * 0.7,
        jaggedness: jaggedness * 1.2,
        seed: seedValue + i,
      });

      branches.push(branch);
    }
  }

  return { main: mainBolt, branches };
}
