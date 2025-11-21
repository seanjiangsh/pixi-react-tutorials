import { useCallback, useEffect, useMemo, useState } from "react";
import { Graphics } from "pixi.js";
import { extend, useTick } from "@pixi/react";
import { GlowFilter } from "pixi-filters";

import { type Point2D } from "src/types/types";
import {
  generateLightningPath,
  type LightningBolt,
} from "src/utils/graphics/path";

extend({ Graphics });

type LighteningGraphicsProps = {
  width: number;
  height: number;
  boltAmount: number;
  displacement: number;
  jaggedness: number;
  segmentPoints: number;
  segmentDensity: number;
  envelopeShape: number;
  smoothingIterations: number;
  lineWidth: number;
  lineWidthVariation: number;
  boltColors: string[];
  glowDistance: number;
  oscillationCycle: number;
  regenerateKey: number;
  opacityVariation?: number;
};

export function LighteningGraphics(props: LighteningGraphicsProps) {
  const { width, height, boltAmount, displacement, jaggedness } = props;
  const { segmentPoints, segmentDensity, envelopeShape, smoothingIterations } =
    props;
  const { lineWidth, lineWidthVariation, boltColors } = props;
  const { glowDistance } = props;
  const { oscillationCycle, regenerateKey } = props;
  const { opacityVariation = 1 } = props;

  // Store segment centers and ranges (generated once per regenerateKey)
  type SegmentPoint = {
    centerX: number;
    centerY: number;
    rangeX: number;
    rangeY: number;
  };

  const boltStructures = useMemo<SegmentPoint[][]>(() => {
    const structures: SegmentPoint[][] = [];
    const start: Point2D = { x: width / 2, y: height * 0.1 };
    const end: Point2D = { x: width / 2, y: height * 0.9 };

    for (let i = 0; i < boltAmount; i++) {
      const baseSeed = regenerateKey * 10000 + 12345 + i * 1000;

      // Create segments at random positions along the bolt's Y axis
      const segments: SegmentPoint[] = [];
      let seedValue = baseSeed;
      const seededRandom = () => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      };

      // Always include start point
      segments.push({
        centerX: start.x,
        centerY: start.y,
        rangeX: 0,
        rangeY: 0,
      });

      // Create random segment points between start and end
      const boltLength = end.y - start.y;
      for (let j = 0; j < segmentPoints; j++) {
        // Random position along the bolt (from 10% to 90%)
        const t = 0.1 + seededRandom() * 0.8;
        const segY = start.y + boltLength * t;

        // Random X offset from center line
        const offsetX = (seededRandom() - 0.5) * displacement * 0.8;
        const segX = start.x + offsetX;

        // Range is a portion of displacement
        const range = displacement * 0.25;

        segments.push({
          centerX: segX,
          centerY: segY,
          rangeX: range,
          rangeY: range,
        });
      }

      // Always include end point
      segments.push({
        centerX: end.x,
        centerY: end.y,
        rangeX: 0,
        rangeY: 0,
      });

      // Sort by Y position to maintain order from top to bottom
      segments.sort((a, b) => a.centerY - b.centerY);

      structures.push(segments);
    }

    return structures;
  }, [width, height, boltAmount, displacement, segmentPoints, regenerateKey]);

  // Track current offsets and velocities for each segment point
  type PointState = {
    offsetX: number;
    offsetY: number;
    velocityX: number;
    velocityY: number;
  };

  // Initialize segment states when bolt structures change
  const initialSegmentStates = useMemo(() => {
    return boltStructures.map((segments, boltIndex) =>
      segments.map((seg, segIndex) => {
        // First and last points don't move
        if (segIndex === 0 || segIndex === segments.length - 1) {
          return { offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0 };
        }

        // Generate random direction for this segment
        let seedValue =
          regenerateKey * 10000 + 12345 + boltIndex * 1000 + segIndex * 100;
        seedValue = (seedValue * 9301 + 49297) % 233280;
        const angle = (seedValue / 233280) * Math.PI * 2;

        return {
          offsetX: 0,
          offsetY: 0,
          velocityX: Math.cos(angle),
          velocityY: Math.sin(angle),
        };
      })
    );
  }, [boltStructures, regenerateKey]);

  const [segmentStates, setSegmentStates] =
    useState<PointState[][]>(initialSegmentStates);

  // Reset segment states whenever bolt structures change (e.g., segmentPoints tweaked)
  useEffect(() => {
    setSegmentStates(initialSegmentStates);
  }, [initialSegmentStates]);

  // Update offsets on each tick
  useTick((delta) => {
    const speed = (delta.deltaMS / (oscillationCycle * 1000)) * Math.PI * 2;

    setSegmentStates((prevStates) => {
      return boltStructures.map((segments, boltIndex) => {
        const prevBoltStates = prevStates[boltIndex] || [];

        return segments.map((seg, segIndex) => {
          // First and last points don't move
          if (segIndex === 0 || segIndex === segments.length - 1) {
            return { offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0 };
          }

          const prevState = prevBoltStates[segIndex] || {
            offsetX: 0,
            offsetY: 0,
            velocityX: 1,
            velocityY: 0,
          };

          // Calculate movement step
          const stepSize = speed * 50;
          let newVelocityX = prevState.velocityX;
          let newVelocityY = prevState.velocityY;
          let newX = prevState.offsetX + newVelocityX * stepSize;
          let newY = prevState.offsetY + newVelocityY * stepSize;

          // Bounce back if exceeding range
          if (Math.abs(newX) > seg.rangeX) {
            newX = Math.sign(newX) * seg.rangeX;
            newVelocityX = -newVelocityX; // Reverse direction
          }
          if (Math.abs(newY) > seg.rangeY) {
            newY = Math.sign(newY) * seg.rangeY;
            newVelocityY = -newVelocityY; // Reverse direction
          }

          return {
            offsetX: newX,
            offsetY: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
          };
        });
      });
    });
  });

  // Animate segment points and draw jagged paths between them
  const lightningBolts = useMemo<LightningBolt[]>(() => {
    return boltStructures.map((segments, boltIndex) => {
      const boltStates = segmentStates[boltIndex] || [];
      const baseSeed = regenerateKey * 10000 + 12345 + boltIndex * 1000;

      // Get animated segment positions
      const animatedSegments: Point2D[] = segments.map((seg, segIndex) => {
        const state = boltStates[segIndex] || {
          offsetX: 0,
          offsetY: 0,
          velocityX: 0,
          velocityY: 0,
        };

        return {
          x: seg.centerX + state.offsetX,
          y: seg.centerY + state.offsetY,
        };
      });

      // Draw jagged lightning between segment points
      const allPoints: Point2D[] = [];
      for (let i = 0; i < animatedSegments.length - 1; i++) {
        const jaggedPath = generateLightningPath({
          start: animatedSegments[i],
          end: animatedSegments[i + 1],
          displacement: displacement * 0.3,
          jaggedness,
          seed: baseSeed + i * 500,
          segmentDensity,
          envelopeShape,
          smoothingIterations,
        });
        // Add all points except the last one (to avoid duplicates)
        allPoints.push(...jaggedPath.slice(0, -1));
      }
      // Add the final point
      allPoints.push(animatedSegments[animatedSegments.length - 1]);

      return {
        main: allPoints,
        branches: [],
      };
    });
  }, [
    boltStructures,
    segmentStates,
    regenerateKey,
    displacement,
    jaggedness,
    segmentDensity,
    envelopeShape,
    smoothingIterations,
  ]);

  // Generate random line widths for each bolt
  const boltWidths = useMemo(() => {
    return Array.from({ length: boltAmount }, (_, i) => {
      // Seeded random for consistent widths
      const seed = (regenerateKey * 10000 + 12345 + i * 1000) * 9301 + 49297;
      const random = (seed % 233280) / 233280;
      const width = lineWidth + (random - 0.5) * 2 * lineWidthVariation;
      return Math.max(1, width); // Ensure width is never below 1
    });
  }, [boltAmount, lineWidth, lineWidthVariation, regenerateKey]);

  // Generate random opacities for each bolt
  const boltOpacities = useMemo(() => {
    return Array.from({ length: boltAmount }, (_, i) => {
      // Different seed for opacity
      const seed = (regenerateKey * 10000 + 54321 + i * 500) * 9301 + 49297;
      const random = (seed % 233280) / 233280;
      const opacity = 1 - random * opacityVariation;
      return Math.max(0.1, opacity); // Ensure opacity is never below 0.1
    });
  }, [boltAmount, opacityVariation, regenerateKey]);

  // Randomly assign colors to each bolt
  const boltColorAssignments = useMemo(() => {
    return Array.from({ length: boltAmount }, (_, i) => {
      // Seeded random for consistent color assignment
      const seed = (regenerateKey * 10000 + 99999 + i * 333) * 9301 + 49297;
      const random = (seed % 233280) / 233280;
      const colorIndex = Math.floor(random * boltColors.length);
      return boltColors[colorIndex];
    });
  }, [boltAmount, regenerateKey, boltColors]);

  // Create individual glow filters for each bolt with matching colors
  const boltGlowFilters = useMemo(
    () =>
      boltColorAssignments.map(
        (color) =>
          new GlowFilter({
            distance: glowDistance,
            color,
          })
      ),
    [boltColorAssignments, glowDistance]
  );

  // Draw function for each individual bolt
  const drawBolt = useCallback(
    (index: number) => (g: Graphics) => {
      g.clear();

      const bolt = lightningBolts[index];
      if (!bolt) return;

      const points = bolt.main;
      if (points.length < 2) return;

      g.setStrokeStyle({
        width: boltWidths[index],
        color: boltColorAssignments[index],
        alpha: boltOpacities[index],
      });

      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
      }
      g.stroke();
    },
    [lightningBolts, boltWidths, boltOpacities, boltColorAssignments]
  );

  return (
    <>
      {/* Draw each lightning bolt with its own glow filter */}
      {lightningBolts.map((_, index) => (
        <pixiGraphics
          key={index}
          draw={drawBolt(index)}
          filters={[boltGlowFilters[index]]}
        />
      ))}
    </>
  );
}
