import type { Point2D } from "src/types/types";
import type { CellCorners } from "./geometry";

export type Spotlight = {
  position: Point2D;
  velocity: Point2D;
  radius: number;
};

export type AnimationPhase =
  | "searching"
  | "focusing"
  | "expanding"
  | "complete";

type SpotlightPhysicsParams = {
  spotlights: Spotlight[];
  animationPhase: AnimationPhase;
  deltaTime: number;
  maxSpeed: number;
  acceleration: number;
  friction: number;
  boardBounds: {
    topLeft: Point2D;
    topRight: Point2D;
    bottomRight: Point2D;
    bottomLeft: Point2D;
  };
  assignedCells?: number[];
  cellCornersCache?: Map<number, CellCorners>;
};

/**
 * Update spotlight physics for one frame
 */
export function updateSpotlightPhysics(params: SpotlightPhysicsParams): void {
  const {
    spotlights,
    animationPhase,
    deltaTime,
    maxSpeed,
    acceleration,
    friction,
    boardBounds,
    assignedCells = [],
    cellCornersCache = new Map(),
  } = params;

  const { topLeft, topRight, bottomRight, bottomLeft } = boardBounds;
  const minX = Math.min(topLeft.x, bottomLeft.x);
  const maxX = Math.max(topRight.x, bottomRight.x);
  const minY = Math.min(topLeft.y, topRight.y);
  const maxY = Math.max(bottomLeft.y, bottomRight.y);

  spotlights.forEach((spotlight, index) => {
    // Phase-based behavior
    if (animationPhase === "searching") {
      // Random walk behavior
      const randomAccel = {
        x: (Math.random() - 0.5) * acceleration * deltaTime,
        y: (Math.random() - 0.5) * acceleration * deltaTime,
      };

      spotlight.velocity.x += randomAccel.x;
      spotlight.velocity.y += randomAccel.y;
    } else if (animationPhase === "focusing") {
      // Move towards assigned cell
      const cellIndex = assignedCells[index];
      if (cellIndex !== undefined) {
        const cellCorners = cellCornersCache.get(cellIndex);
        if (cellCorners) {
          const dx = cellCorners.center.x - spotlight.position.x;
          const dy = cellCorners.center.y - spotlight.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 1) {
            const lerpSpeed = 0.1;
            spotlight.velocity.x = dx * lerpSpeed;
            spotlight.velocity.y = dy * lerpSpeed;
          } else {
            spotlight.velocity.x *= 0.9;
            spotlight.velocity.y *= 0.9;
          }
        }
      }
    }

    // Apply friction
    spotlight.velocity.x *= friction;
    spotlight.velocity.y *= friction;

    // Limit speed
    const speed = Math.sqrt(
      spotlight.velocity.x ** 2 + spotlight.velocity.y ** 2
    );
    if (speed > maxSpeed) {
      spotlight.velocity.x = (spotlight.velocity.x / speed) * maxSpeed;
      spotlight.velocity.y = (spotlight.velocity.y / speed) * maxSpeed;
    }

    // Update position
    spotlight.position.x += spotlight.velocity.x;
    spotlight.position.y += spotlight.velocity.y;

    // Bounce off board boundaries
    if (spotlight.position.x < minX) {
      spotlight.position.x = minX;
      spotlight.velocity.x = Math.abs(spotlight.velocity.x);
    } else if (spotlight.position.x > maxX) {
      spotlight.position.x = maxX;
      spotlight.velocity.x = -Math.abs(spotlight.velocity.x);
    }

    if (spotlight.position.y < minY) {
      spotlight.position.y = minY;
      spotlight.velocity.y = Math.abs(spotlight.velocity.y);
    } else if (spotlight.position.y > maxY) {
      spotlight.position.y = maxY;
      spotlight.velocity.y = -Math.abs(spotlight.velocity.y);
    }
  });
}

/**
 * Assign spotlights to cells using velocity-aware proximity with unique assignment
 */
export function assignSpotlightsToCells(
  spotlights: Spotlight[],
  focusedCells: number[],
  cellCornersCache: Map<number, CellCorners>,
  velocityWeight: number
): number[] {
  if (focusedCells.length === 0 || cellCornersCache.size === 0) return [];

  const assignments: number[] = [];
  const usedCells = new Set<number>();

  // Calculate scores for all spotlight-cell pairs
  const spotlightScores: Array<{
    spotlightIndex: number;
    cellIndex: number;
    score: number;
  }> = [];

  spotlights.forEach((spotlight, spotlightIndex) => {
    focusedCells.forEach((cellIndex) => {
      const corners = cellCornersCache.get(cellIndex);
      if (!corners) return;

      const dx = corners.center.x - spotlight.position.x;
      const dy = corners.center.y - spotlight.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Velocity-aware scoring: predict where spotlight is heading
      const velocityDot =
        (spotlight.velocity.x * dx + spotlight.velocity.y * dy) /
        (distance || 1);
      const score = distance - velocityDot * velocityWeight;

      spotlightScores.push({ spotlightIndex, cellIndex, score });
    });
  });

  // Sort by score (best matches first)
  spotlightScores.sort((a, b) => a.score - b.score);

  // Assign spotlights to cells, prioritizing unique assignments
  const assignedSpotlights = new Set<number>();

  // First pass: assign each spotlight to a unique cell
  for (const { spotlightIndex, cellIndex } of spotlightScores) {
    if (!assignedSpotlights.has(spotlightIndex) && !usedCells.has(cellIndex)) {
      assignments[spotlightIndex] = cellIndex;
      assignedSpotlights.add(spotlightIndex);
      usedCells.add(cellIndex);
    }
  }

  // Second pass: if there are unassigned spotlights, assign to already-used cells
  if (assignedSpotlights.size < spotlights.length) {
    for (const { spotlightIndex, cellIndex } of spotlightScores) {
      if (!assignedSpotlights.has(spotlightIndex)) {
        assignments[spotlightIndex] = cellIndex;
        assignedSpotlights.add(spotlightIndex);
      }
    }
  }

  return assignments;
}

/**
 * Initialize spotlights within board bounds
 */
export function createSpotlights(
  count: number,
  radius: number,
  maxSpeed: number,
  boardBounds: {
    topLeft: Point2D;
    topRight: Point2D;
    bottomRight: Point2D;
    bottomLeft: Point2D;
  }
): Spotlight[] {
  const { topLeft, topRight, bottomRight, bottomLeft } = boardBounds;
  const minX = Math.min(topLeft.x, bottomLeft.x);
  const maxX = Math.max(topRight.x, bottomRight.x);
  const minY = Math.min(topLeft.y, topRight.y);
  const maxY = Math.max(bottomLeft.y, bottomRight.y);

  return Array.from({ length: count }, () => ({
    position: {
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
    },
    velocity: {
      x: (Math.random() - 0.5) * maxSpeed * 0.5,
      y: (Math.random() - 0.5) * maxSpeed * 0.5,
    },
    radius,
  }));
}
