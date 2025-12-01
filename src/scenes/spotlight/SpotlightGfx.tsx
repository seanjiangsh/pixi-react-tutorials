import { useState, useCallback, useEffect, useRef } from "react";
import { Graphics } from "pixi.js";
import { extend, useTick } from "@pixi/react";

import type { Point2D } from "src/types/types";

extend({ Graphics });

type Spotlight = {
  position: Point2D;
  velocity: Point2D;
  radius: number;
};

type CellCorners = {
  topLeft: Point2D;
  topRight: Point2D;
  bottomRight: Point2D;
  bottomLeft: Point2D;
  center: Point2D;
  width: number;
  height: number;
};

type AnimationPhase = "searching" | "focusing" | "expanding" | "complete";

type AnimationControls = {
  autoAdvance: boolean;
  focusDuration: number;
  expandDuration: number;
  expandPause: number;
  velocityWeight: number;
};

type SpotlightGfxProps = {
  showDimming?: boolean;
  dimmingOpacity?: number;
  spotlightCount?: number;
  spotlightRadius?: number;
  maxSpeed?: number;
  acceleration?: number;
  friction?: number;
  animationPhase?: AnimationPhase;
  focusedCells?: number[];
  animationControls?: AnimationControls;
  cellCornersCache?: Map<number, CellCorners>;
  onPhaseComplete?: () => void;
};

export function SpotlightGfx(props: SpotlightGfxProps) {
  const {
    showDimming = true,
    dimmingOpacity = 0.75,
    spotlightCount = 2,
    spotlightRadius = 80,
    maxSpeed = 100,
    acceleration = 50,
    friction = 0.95,
    animationPhase = "searching",
    focusedCells = [],
    animationControls = {
      autoAdvance: true,
      focusDuration: 1.0,
      expandDuration: 0.8,
      expandPause: 0.3,
      velocityWeight: 50,
    },
    onPhaseComplete,
  } = props;

  // Cache board bounds and cell corners
  const [boardBounds, setBoardBounds] = useState<{
    topLeft: Point2D;
    topRight: Point2D;
    bottomRight: Point2D;
    bottomLeft: Point2D;
  } | null>(null);

  const [cellCornersCache, setCellCornersCache] = useState<
    Map<number, CellCorners>
  >(new Map());

  // Spotlight state
  const spotlightsRef = useRef<Spotlight[]>([]);
  const canvasSizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [, forceUpdate] = useState({});

  // Phase timing refs
  const phaseStartTimeRef = useRef<number>(0);
  const assignedCellsRef = useRef<number[]>([]);
  const expandingStartTimeRef = useRef<number>(0);

  // Initialize spotlights
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas || !boardBounds) return;

    const rect = canvas.getBoundingClientRect();
    canvasSizeRef.current = { width: rect.width, height: rect.height };

    // Calculate board bounding box for constraining spotlights
    const { topLeft, topRight, bottomRight, bottomLeft } = boardBounds;
    const minX = Math.min(topLeft.x, bottomLeft.x);
    const maxX = Math.max(topRight.x, bottomRight.x);
    const minY = Math.min(topLeft.y, topRight.y);
    const maxY = Math.max(bottomLeft.y, bottomRight.y);

    spotlightsRef.current = Array.from({ length: spotlightCount }, () => ({
      position: {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
      },
      velocity: {
        x: (Math.random() - 0.5) * maxSpeed * 0.5,
        y: (Math.random() - 0.5) * maxSpeed * 0.5,
      },
      radius: spotlightRadius,
    }));
  }, [spotlightCount, maxSpeed, spotlightRadius, boardBounds]);

  // Assign spotlights to cells using velocity-aware proximity with unique assignment
  const assignSpotlightsToCell = useCallback(() => {
    if (focusedCells.length === 0 || cellCornersCache.size === 0) return [];

    const assignments: number[] = [];
    const usedCells = new Set<number>();

    // Calculate scores for all spotlight-cell pairs
    const spotlightScores: Array<{
      spotlightIndex: number;
      cellIndex: number;
      score: number;
    }> = [];

    spotlightsRef.current.forEach((spotlight, spotlightIndex) => {
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
        const score = distance - velocityDot * animationControls.velocityWeight;

        spotlightScores.push({ spotlightIndex, cellIndex, score });
      });
    });

    // Sort by score (best matches first)
    spotlightScores.sort((a, b) => a.score - b.score);

    // Assign spotlights to cells, prioritizing unique assignments
    const assignedSpotlights = new Set<number>();

    // First pass: assign each spotlight to a unique cell
    for (const { spotlightIndex, cellIndex } of spotlightScores) {
      if (
        !assignedSpotlights.has(spotlightIndex) &&
        !usedCells.has(cellIndex)
      ) {
        assignments[spotlightIndex] = cellIndex;
        assignedSpotlights.add(spotlightIndex);
        usedCells.add(cellIndex);
      }
    }

    // Second pass: if there are unassigned spotlights (more spotlights than cells),
    // assign them to already-used cells
    if (assignedSpotlights.size < spotlightsRef.current.length) {
      for (const { spotlightIndex, cellIndex } of spotlightScores) {
        if (!assignedSpotlights.has(spotlightIndex)) {
          assignments[spotlightIndex] = cellIndex;
          assignedSpotlights.add(spotlightIndex);
        }
      }
    }

    return assignments;
  }, [focusedCells, cellCornersCache, animationControls.velocityWeight]);

  // Reset phase timer when phase changes
  useEffect(() => {
    phaseStartTimeRef.current = Date.now();
    if (animationPhase === "focusing" || animationPhase === "expanding") {
      assignedCellsRef.current = assignSpotlightsToCell();
    }
    // Reset expanding timer when phase changes away from expanding
    if (animationPhase !== "expanding") {
      expandingStartTimeRef.current = 0;
    }
  }, [animationPhase, assignSpotlightsToCell]);

  // Animation loop for spotlight physics
  useTick((ticker) => {
    const { width, height } = canvasSizeRef.current;
    if (width === 0 || height === 0) return;

    const deltaTime = ticker.deltaTime / 60; // Convert to seconds

    // Initialize expanding phase timer synchronously when phase changes
    if (animationPhase === "expanding" && expandingStartTimeRef.current === 0) {
      expandingStartTimeRef.current = Date.now();
    }

    // Phase timing and auto-advance
    const currentElapsedTime = (Date.now() - phaseStartTimeRef.current) / 1000;
    if (animationControls.autoAdvance && onPhaseComplete) {
      if (
        animationPhase === "focusing" &&
        currentElapsedTime > animationControls.focusDuration
      ) {
        onPhaseComplete();
        return;
      } else if (
        animationPhase === "expanding" &&
        currentElapsedTime >
          animationControls.expandPause + animationControls.expandDuration
      ) {
        onPhaseComplete();
        return;
      }
    }

    // Force re-render to update spotlight positions
    forceUpdate({});

    spotlightsRef.current.forEach((spotlight, index) => {
      // Phase-based behavior
      if (animationPhase === "searching") {
        // Random walk behavior
        const randomAccel = {
          x: (Math.random() - 0.5) * acceleration * deltaTime,
          y: (Math.random() - 0.5) * acceleration * deltaTime,
        };

        // Apply acceleration
        spotlight.velocity.x += randomAccel.x;
        spotlight.velocity.y += randomAccel.y;
      } else if (animationPhase === "focusing") {
        // Move towards assigned cell
        const assignments = assignSpotlightsToCell();
        if (assignments[index] !== undefined) {
          const cellCorners = cellCornersCache.get(assignments[index]);
          if (cellCorners) {
            const dx = cellCorners.center.x - spotlight.position.x;
            const dy = cellCorners.center.y - spotlight.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {
              // Lerp towards target
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

      // Update position (velocity already accounts for time)
      spotlight.position.x += spotlight.velocity.x;
      spotlight.position.y += spotlight.velocity.y;

      // Bounce off board boundaries
      if (boardBounds) {
        const { topLeft, topRight, bottomRight, bottomLeft } = boardBounds;
        const minX = Math.min(topLeft.x, bottomLeft.x);
        const maxX = Math.max(topRight.x, bottomRight.x);
        const minY = Math.min(topLeft.y, topRight.y);
        const maxY = Math.max(bottomLeft.y, bottomRight.y);

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
      }
    });
  });

  // Helper to get board bounding box
  const getBoardBounds = useCallback(() => {
    const board = document.querySelector(".roulette-board");
    const canvas = document.querySelector("canvas");

    if (!board || !canvas) return null;

    const canvasRect = canvas.getBoundingClientRect();

    // Create temporary corner elements inside the board to detect transformed corners
    const createCornerPoint = (style: string) => {
      const point = document.createElement("div");
      point.style.cssText = `position: absolute; width: 1px; height: 1px; pointer-events: none; opacity: 0; ${style}`;
      return point;
    };

    const cornerTL = createCornerPoint("top: 0; left: 0;");
    const cornerTR = createCornerPoint("top: 0; right: 0;");
    const cornerBR = createCornerPoint("bottom: 0; right: 0;");
    const cornerBL = createCornerPoint("bottom: 0; left: 0;");

    board.appendChild(cornerTL);
    board.appendChild(cornerTR);
    board.appendChild(cornerBR);
    board.appendChild(cornerBL);

    // Force reflow
    board.getBoundingClientRect();

    const tlRect = cornerTL.getBoundingClientRect();
    const trRect = cornerTR.getBoundingClientRect();
    const brRect = cornerBR.getBoundingClientRect();
    const blRect = cornerBL.getBoundingClientRect();

    // Clean up
    board.removeChild(cornerTL);
    board.removeChild(cornerTR);
    board.removeChild(cornerBR);
    board.removeChild(cornerBL);

    return {
      topLeft: {
        x: tlRect.left - canvasRect.left,
        y: tlRect.top - canvasRect.top,
      },
      topRight: {
        x: trRect.left - canvasRect.left,
        y: trRect.top - canvasRect.top,
      },
      bottomRight: {
        x: brRect.left - canvasRect.left,
        y: brRect.top - canvasRect.top,
      },
      bottomLeft: {
        x: blRect.left - canvasRect.left,
        y: blRect.top - canvasRect.top,
      },
    };
  }, []);

  // Helper to get cell corners for a specific cell index
  const getCellCorners = useCallback(
    (cellIndex: number): CellCorners | null => {
      const board = document.querySelector(".roulette-board");
      const canvas = document.querySelector("canvas");

      if (!board || !canvas) return null;

      const cell = board.querySelector(
        `.roulette-cell[data-cell-index="${cellIndex}"]`
      ) as HTMLElement;

      if (!cell) return null;

      // Query corner test points for actual transformed positions
      const tlCorner = cell.querySelector('[data-corner="tl"]');
      const trCorner = cell.querySelector('[data-corner="tr"]');
      const brCorner = cell.querySelector('[data-corner="br"]');
      const blCorner = cell.querySelector('[data-corner="bl"]');

      if (!tlCorner || !trCorner || !brCorner || !blCorner) return null;

      const canvasRect = canvas.getBoundingClientRect();

      // Measure actual transformed corner positions
      const tlRect = tlCorner.getBoundingClientRect();
      const trRect = trCorner.getBoundingClientRect();
      const brRect = brCorner.getBoundingClientRect();
      const blRect = blCorner.getBoundingClientRect();

      const topLeft = {
        x: tlRect.left - canvasRect.left,
        y: tlRect.top - canvasRect.top,
      };
      const topRight = {
        x: trRect.right - canvasRect.left,
        y: trRect.top - canvasRect.top,
      };
      const bottomRight = {
        x: brRect.right - canvasRect.left,
        y: brRect.bottom - canvasRect.top,
      };
      const bottomLeft = {
        x: blRect.left - canvasRect.left,
        y: blRect.bottom - canvasRect.top,
      };

      const center = {
        x: (topLeft.x + topRight.x + bottomRight.x + bottomLeft.x) / 4,
        y: (topLeft.y + topRight.y + bottomRight.y + bottomLeft.y) / 4,
      };

      const width = Math.max(
        Math.abs(topRight.x - topLeft.x),
        Math.abs(bottomRight.x - bottomLeft.x)
      );
      const height = Math.max(
        Math.abs(bottomLeft.y - topLeft.y),
        Math.abs(bottomRight.y - topRight.y)
      );

      return {
        topLeft,
        topRight,
        bottomRight,
        bottomLeft,
        center,
        width,
        height,
      };
    },
    []
  );

  // Measure board and cells on mount and resize
  useEffect(() => {
    const measureGeometry = () => {
      const bounds = getBoardBounds();
      setBoardBounds(bounds);

      // Measure all 37 cells
      const cellMap = new Map<number, CellCorners>();
      for (let i = 0; i < 37; i++) {
        const corners = getCellCorners(i);
        if (corners) {
          cellMap.set(i, corners);
        }
      }
      setCellCornersCache(cellMap);
    };

    // Initial measurement with delay to ensure DOM is ready
    setTimeout(measureGeometry, 100);

    // Re-measure on resize
    window.addEventListener("resize", measureGeometry);
    return () => window.removeEventListener("resize", measureGeometry);
  }, [getBoardBounds, getCellCorners]);

  // Draw dimming overlay covering the board
  const drawDimming = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!showDimming || !boardBounds) return;

      const { topLeft, topRight, bottomRight, bottomLeft } = boardBounds;

      // Extend right and bottom edges to compensate for 3D transform
      const extendRight = 2;
      const extendBottom = 2;

      // Draw polygon covering the board
      g.setFillStyle({ color: 0x000000, alpha: dimmingOpacity });
      g.moveTo(topLeft.x, topLeft.y);
      g.lineTo(topRight.x + extendRight, topRight.y);
      g.lineTo(bottomRight.x + extendRight, bottomRight.y + extendBottom);
      g.lineTo(bottomLeft.x, bottomLeft.y + extendBottom);
      g.closePath();
      g.fill();
    },
    [showDimming, boardBounds, dimmingOpacity]
  );

  // Draw spotlights with erase blend mode (no useCallback to ensure re-render)
  const drawSpotlights = (g: Graphics) => {
    g.clear();
    if (!showDimming) return;

    // Use erase blend mode to create holes in the dimming layer
    g.blendMode = "erase";

    // Initialize expanding phase timer synchronously on first draw call
    if (animationPhase === "expanding" && expandingStartTimeRef.current === 0) {
      expandingStartTimeRef.current = Date.now();
    }

    spotlightsRef.current.forEach((spotlight, index) => {
      g.setFillStyle({ color: 0xffffff, alpha: 1 });

      if (animationPhase === "expanding" || animationPhase === "complete") {
        // Get assigned cell for this spotlight
        const assignedCell = assignedCellsRef.current[index];
        const cellCorners = cellCornersCache.get(assignedCell);

        if (cellCorners) {
          let progress = 1;
          if (animationPhase === "expanding") {
            // Calculate elapsed time specifically for expanding phase
            const expandingElapsedTime =
              (Date.now() - expandingStartTimeRef.current) / 1000;
            const morphStart = animationControls.expandPause;
            const morphDuration = animationControls.expandDuration;
            const timeSinceMorphStart = Math.max(
              0,
              expandingElapsedTime - morphStart
            );
            progress = Math.min(1, timeSinceMorphStart / morphDuration);
          }

          // Interpolate from circle to actual cell shape (trapezoid)
          const { topLeft, topRight, bottomRight, bottomLeft } = cellCorners;

          if (progress < 1) {
            // During morphing: move circle center to cell center and shrink radius
            const lerp = (start: number, end: number, t: number) =>
              start + (end - start) * t;

            // Interpolate position from spotlight to cell center
            const currentX = lerp(
              spotlight.position.x,
              cellCorners.center.x,
              progress
            );
            const currentY = lerp(
              spotlight.position.y,
              cellCorners.center.y,
              progress
            );
            // Shrink radius to smaller of cell width/height
            const targetRadius =
              Math.min(cellCorners.width, cellCorners.height) / 2;
            const currentRadius = lerp(
              spotlight.radius,
              targetRadius,
              progress
            );

            // Draw circle
            g.circle(currentX, currentY, currentRadius);
            g.fill();
          } else {
            // Fully expanded: draw exact cell shape
            g.moveTo(topLeft.x, topLeft.y);
            g.lineTo(topRight.x, topRight.y);
            g.lineTo(bottomRight.x, bottomRight.y);
            g.lineTo(bottomLeft.x, bottomLeft.y);
            g.closePath();
            g.fill();
          }
        } else {
          // Fallback to circle if no cell data
          g.circle(
            spotlight.position.x,
            spotlight.position.y,
            spotlight.radius
          );
          g.fill();
        }
      } else {
        // Searching and focusing phases: draw circles
        g.circle(spotlight.position.x, spotlight.position.y, spotlight.radius);
        g.fill();
      }
    });
  };

  return (
    <>
      {/* Dimming overlay */}
      <pixiGraphics draw={drawDimming} />
      {/* Spotlights (erase from dimming) */}
      <pixiGraphics draw={drawSpotlights} />
    </>
  );
}
