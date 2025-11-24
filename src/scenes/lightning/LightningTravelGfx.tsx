import { useMemo, useState, useCallback, useEffect } from "react";
import { Graphics } from "pixi.js";
import { extend, useTick } from "@pixi/react";
import { GlowFilter } from "pixi-filters";

import type { Point2D } from "src/types/types";
import { genLightningWithBranches } from "src/utils/graphics/path";

extend({ Graphics });

type LightningTravelGfxProps = {
  fromCell: { col: number; row: number };
  toCell: { col: number; row: number };
  boltColor?: string;
  lineWidth?: number;
  glowDistance?: number;
  displacement?: number;
  jaggedness?: number;
  branchProbability?: number;
  branchLength?: number;
  travelDuration?: number; // Duration in seconds for the bolt to travel
  seed?: number; // Seed for generating different bolt variations
  onConnect?: (point: Point2D) => void; // Callback when bolt connects
};

export function LightningTravelGfx(props: LightningTravelGfxProps) {
  const {
    fromCell,
    toCell,
    boltColor = "#feff84",
    lineWidth = 2,
    glowDistance = 10,
    displacement = 30,
    jaggedness = 0.5,
    branchProbability = 0.2,
    branchLength = 0.4,
    travelDuration = 0.5,
    seed = 0,
    onConnect,
  } = props;

  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [boltData, setBoltData] = useState<{
    main: Point2D[];
    branches: Point2D[][];
  } | null>(null);

  // Helper to get cell corners in canvas coordinates
  const getCellCorners = useCallback((col: number, row: number) => {
    const gridOverlay = document.querySelector(".grid-overlay");
    if (!gridOverlay) return null;

    const gridStyle = window.getComputedStyle(gridOverlay);
    const gridTemplateColumns = gridStyle.gridTemplateColumns;
    const cols = gridTemplateColumns.split(" ").length;

    const cellIndex = row * cols + col;
    const cell = gridOverlay.querySelector(
      `.grid-cell:nth-child(${cellIndex + 1})`
    ) as HTMLElement;

    if (!cell) return null;

    const canvas = document.querySelector("canvas");
    if (!canvas) return null;

    const cellRect = cell.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Return 4 corners and center
    return {
      topLeft: {
        x: cellRect.left - canvasRect.left,
        y: cellRect.top - canvasRect.top,
      },
      topRight: {
        x: cellRect.right - canvasRect.left,
        y: cellRect.top - canvasRect.top,
      },
      bottomRight: {
        x: cellRect.right - canvasRect.left,
        y: cellRect.bottom - canvasRect.top,
      },
      bottomLeft: {
        x: cellRect.left - canvasRect.left,
        y: cellRect.bottom - canvasRect.top,
      },
      center: {
        x: cellRect.left + cellRect.width / 2 - canvasRect.left,
        y: cellRect.top + cellRect.height / 2 - canvasRect.top,
      },
    };
  }, []);

  // Helper to find closest path between two cells
  const getClosestPath = useCallback(
    (from: { col: number; row: number }, to: { col: number; row: number }) => {
      // No bolt if cells are the same
      if (from.col === to.col && from.row === to.row) return null;

      const fromCorners = getCellCorners(from.col, from.row);
      const toCorners = getCellCorners(to.col, to.row);

      if (!fromCorners || !toCorners) return null;

      //  use shortest edge-to-edge path
      const getEdgePoints = (corners: typeof fromCorners) => [
        corners.topLeft,
        corners.topRight,
        corners.bottomRight,
        corners.bottomLeft,
        corners.center, // Include center as a valid point
        {
          x: (corners.topLeft.x + corners.topRight.x) / 2,
          y: corners.topLeft.y,
        }, // top middle
        {
          x: corners.topRight.x,
          y: (corners.topRight.y + corners.bottomRight.y) / 2,
        }, // right middle
        {
          x: (corners.bottomLeft.x + corners.bottomRight.x) / 2,
          y: corners.bottomLeft.y,
        }, // bottom middle
        {
          x: corners.topLeft.x,
          y: (corners.topLeft.y + corners.bottomLeft.y) / 2,
        }, // left middle
      ];

      const fromPoints = getEdgePoints(fromCorners);
      const toPoints = getEdgePoints(toCorners);

      // Find the shortest distance between any two points
      let minDistance = Infinity;
      let bestStart: Point2D = fromCorners.center;
      let bestEnd: Point2D = toCorners.center;

      for (const fromPoint of fromPoints) {
        for (const toPoint of toPoints) {
          const distance = Math.sqrt(
            Math.pow(toPoint.x - fromPoint.x, 2) +
              Math.pow(toPoint.y - fromPoint.y, 2)
          );

          if (distance < minDistance) {
            minDistance = distance;
            bestStart = fromPoint;
            bestEnd = toPoint;
          }
        }
      }

      return { start: bestStart, end: bestEnd };
    },
    [getCellCorners]
  );

  const glowFilter = useMemo(
    () =>
      new GlowFilter({
        distance: glowDistance,
        outerStrength: 2,
        innerStrength: 1,
        color: parseInt(boltColor.replace("#", "0x")),
      }),
    [boltColor, glowDistance]
  );

  // Generate new bolt when cells change
  useEffect(() => {
    const path = getClosestPath(fromCell, toCell);
    if (!path) return;

    const { start, end } = path;
    const bolt = genLightningWithBranches({
      start,
      end,
      displacement,
      jaggedness,
      branchProbability,
      branchLength,
      seed: Math.random() * 1000 + seed * 137, // Use seed with random for variation
    });

    // Add random start delay based on seed for staggered effect
    const delay = (seed % 10) * 0.1; // 0 to 100ms

    setBoltData(bolt);
    setProgress(-delay); // Start negative to account for delay
    setIsAnimating(true);
  }, [
    fromCell,
    toCell,
    displacement,
    jaggedness,
    branchProbability,
    branchLength,
    seed,
    getClosestPath,
  ]);

  // Animate progress
  const animate = useCallback(() => {
    if (!isAnimating) return;

    setProgress((prev) => {
      const deltaSeconds = 1 / 60;
      const increment = deltaSeconds / travelDuration;
      const next = prev + increment;

      // Don't draw until delay has passed
      if (next < 0) return next;

      if (next >= 1) {
        setIsAnimating(false);
        // Clear the bolt after animation completes
        setBoltData(null);
        return 1;
      }

      return next;
    });
  }, [isAnimating, travelDuration]);

  useTick(animate);

  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      // Don't draw during delay period or if no data
      if (!boltData || progress <= 0) return;

      const { main, branches } = boltData;

      // Define animation phases
      const connectPhase = 0.3; // 30% - traveling phase (dim)
      const brightPhase = 0.35; // 5% - sudden bright when connected
      const blinkPhase = 0.7; // 35% - blinking phase
      const fadePhase = 1.0; // 30% - fade out phase

      let alpha = 1;
      let currentWidth = lineWidth;
      let mainPointsToDraw = Math.floor(main.length * progress);

      // Phase 1: Traveling (0 - 30%) - Dim light, progressive drawing
      if (progress < connectPhase) {
        const travelProgress = progress / connectPhase;
        mainPointsToDraw = Math.floor(main.length * travelProgress);
        alpha = 0.3; // Dim during travel
        currentWidth = lineWidth * 0.7; // Thinner during travel
      }
      // Phase 2: Connection flash (30% - 35%) - Sudden bright
      else if (progress < brightPhase) {
        // Trigger onConnect callback at the moment of connection (first frame only)
        if (
          progress >= connectPhase &&
          progress < connectPhase + 0.01 &&
          onConnect &&
          main.length > 0
        ) {
          onConnect(main[main.length - 1]); // Report the end point
        }
        mainPointsToDraw = main.length; // Fully connected
        alpha = 1; // Full brightness
        currentWidth = lineWidth * 1.5; // Thicker flash
      }
      // Phase 3: Blinking (35% - 70%)
      else if (progress < blinkPhase) {
        mainPointsToDraw = main.length;
        const blinkProgress =
          (progress - brightPhase) / (blinkPhase - brightPhase);
        // Create 3-4 blinks using sine wave
        const blinkFrequency = 12;
        const blinkValue = Math.sin(blinkProgress * Math.PI * blinkFrequency);
        alpha = 0.3 + Math.abs(blinkValue) * 0.7; // Oscillate between 0.3 and 1
        currentWidth = lineWidth * (0.8 + Math.abs(blinkValue) * 0.4); // Oscillate width
      }
      // Phase 4: Fade out (70% - 100%)
      else {
        mainPointsToDraw = main.length;
        const fadeProgress = (progress - blinkPhase) / (fadePhase - blinkPhase);
        alpha = 1 - fadeProgress; // Fade from 1 to 0
        currentWidth = lineWidth * (1 - fadeProgress * 0.8); // Shrink to 20% of original
      }

      if (mainPointsToDraw < 2) return;

      // Draw main bolt
      g.setStrokeStyle({
        width: currentWidth,
        color: boltColor,
        alpha: alpha,
      });

      g.moveTo(main[0].x, main[0].y);
      for (let i = 1; i < mainPointsToDraw; i++) {
        g.lineTo(main[i].x, main[i].y);
      }
      g.stroke();

      // Draw branches with same effects
      if (progress >= connectPhase) {
        // Only show branches after connection
        branches.forEach((branch) => {
          if (branch.length === 0) return;

          // Check if main bolt has reached the branch start point
          const branchStart = branch[0];
          let branchReached = false;

          for (let i = 0; i < mainPointsToDraw; i++) {
            const dist = Math.sqrt(
              Math.pow(main[i].x - branchStart.x, 2) +
                Math.pow(main[i].y - branchStart.y, 2)
            );
            if (dist < 5) {
              branchReached = true;
              break;
            }
          }

          if (branchReached) {
            g.setStrokeStyle({
              width: currentWidth * 0.6,
              color: boltColor,
              alpha: alpha * 0.8,
            });

            g.moveTo(branch[0].x, branch[0].y);
            for (let i = 1; i < branch.length; i++) {
              g.lineTo(branch[i].x, branch[i].y);
            }
            g.stroke();
          }
        });
      }
    },
    [boltData, progress, lineWidth, boltColor, onConnect]
  );

  return <pixiGraphics draw={draw} filters={[glowFilter]} />;
}
