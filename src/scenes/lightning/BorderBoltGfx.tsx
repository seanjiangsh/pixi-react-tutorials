import { useMemo, useState, useCallback, useEffect } from "react";
import { Graphics } from "pixi.js";
import { extend, useTick } from "@pixi/react";
import { GlowFilter } from "pixi-filters";

import type { GeneratedPoints } from "src/utils/graphics/misc";
import { genRectPath } from "src/utils/graphics/path";

extend({ Graphics });

type BorderBoltGfxProps = {
  boltColor?: string;
  lineWidth?: number;
  glowDistance?: number;
  tiltMode: "flat" | "slope";
  jaggedAmplitude?: number;
  jaggedFrequency1?: number;
  jaggedFrequency2?: number;
  jaggedFrequency3?: number;
  timeScale?: number;
  randomness?: number;
  inset?: number;
  borderRadius?: number;
};

export function BorderBoltGfx({
  boltColor = "#feff84",
  lineWidth = 2,
  glowDistance = 10,
  tiltMode,
  jaggedAmplitude = 3,
  jaggedFrequency1 = 0.3,
  jaggedFrequency2 = 0.7,
  jaggedFrequency3 = 1.2,
  timeScale = 10,
  randomness = 0.5,
  inset = 0,
  borderRadius = 8,
}: BorderBoltGfxProps) {
  const [progress, setProgress] = useState(0);
  // Cache corners and only recalculate when needed
  const [cachedCorners, setCachedCorners] =
    useState<ReturnType<typeof getFocusedRectCorners>>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Seeded random for consistent but varied jagged effect
  const seededRandom = useCallback((seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }, []);

  // Helper to get focused cell rect corners (accounting for transform)
  const getFocusedRectCorners = useCallback(() => {
    const focusedCell = document.querySelector(".grid-cell.focused");
    if (!focusedCell) {
      return null;
    }
    const gridOverlay = document.querySelector(".grid-overlay");
    if (!gridOverlay) {
      return null;
    }

    // Get the Application canvas to calculate offset
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      return null;
    }

    // Get the bounding rects
    const rect = focusedCell.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate the 4 corners relative to the canvas (Pixi.js coordinate system)
    // These corners account for the CSS transform
    const topLeft = {
      x: rect.left - canvasRect.left + inset,
      y: rect.top - canvasRect.top + inset,
    };
    const topRight = {
      x: rect.right - canvasRect.left - inset,
      y: rect.top - canvasRect.top + inset,
    };
    const bottomRight = {
      x: rect.right - canvasRect.left - inset,
      y: rect.bottom - canvasRect.top - inset,
    };
    const bottomLeft = {
      x: rect.left - canvasRect.left + inset,
      y: rect.bottom - canvasRect.top - inset,
    };

    return { topLeft, topRight, bottomRight, bottomLeft };
  }, [inset]);

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

  // Handle tilt mode changes - enable transition mode during animation
  useEffect(() => {
    // Start transition
    setIsTransitioning(true);
    setCachedCorners(null);

    const timer = setTimeout(() => {
      // End transition after CSS animation completes
      setIsTransitioning(false);
      setCachedCorners(getFocusedRectCorners());
    }, 1100); // CSS animation duration + buffer

    return () => clearTimeout(timer);
  }, [tiltMode, inset, getFocusedRectCorners]);

  // Initial corners calculation and watch for focused cell changes
  useEffect(() => {
    // Use MutationObserver to watch for class changes on grid cells
    const gridOverlay = document.querySelector(".grid-overlay");
    if (!gridOverlay) return;

    // Initial calculation
    setCachedCorners(getFocusedRectCorners());

    const observer = new MutationObserver((mutations) => {
      // Only recalculate if the 'focused' class changed on a grid-cell
      const hasFocusChange = mutations.some((mutation) => {
        const target = mutation.target as Element;
        return target.classList.contains("grid-cell");
      });

      if (hasFocusChange) {
        setCachedCorners(getFocusedRectCorners());
      }
    });

    observer.observe(gridOverlay, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
      childList: false,
    });

    return () => observer.disconnect();
  }, [getFocusedRectCorners]);

  // Get border path segment (50% of perimeter) using actual corners
  const getBorderPathSegment = (
    corners: ReturnType<typeof getFocusedRectCorners>,
    progress: number
  ) => {
    if (!corners) return [];

    const { topLeft, topRight, bottomRight, bottomLeft } = corners;

    // Calculate width and height from the corners
    const width = Math.sqrt(
      Math.pow(topRight.x - topLeft.x, 2) + Math.pow(topRight.y - topLeft.y, 2)
    );
    const height = Math.sqrt(
      Math.pow(bottomLeft.x - topLeft.x, 2) +
        Math.pow(bottomLeft.y - topLeft.y, 2)
    );

    // Generate rounded rect path (centered at 0,0 internally, then shifted by origin)
    const borderPath = genRectPath({
      width,
      height,
      radius: borderRadius,
      segments: 200,
      origin: { x: 0, y: 0 },
    });

    // Transform the path points to match the actual trapezoid corners
    // genRectPath generates points from -width/2 to width/2, -height/2 to height/2
    const transformedPath: GeneratedPoints = borderPath.map((point, index) => {
      // Normalize point position: genRectPath outputs from -w/2 to w/2, -h/2 to h/2
      // Map to 0-1 range
      const u = (point.x + width / 2) / width; // horizontal ratio (0 to 1)
      const v = (point.y + height / 2) / height; // vertical ratio (0 to 1)

      // Bilinear interpolation to map rect to trapezoid
      const x =
        topLeft.x * (1 - u) * (1 - v) +
        topRight.x * u * (1 - v) +
        bottomRight.x * u * v +
        bottomLeft.x * (1 - u) * v;

      const y =
        topLeft.y * (1 - u) * (1 - v) +
        topRight.y * u * (1 - v) +
        bottomRight.y * u * v +
        bottomLeft.y * (1 - u) * v;

      // Add jagged electric effect
      // Use tangent to get perpendicular direction for displacement
      const tangent = point.tangent;
      if (tangent) {
        const tangentLength = Math.sqrt(
          tangent.dx * tangent.dx + tangent.dy * tangent.dy
        );
        const perpX = -tangent.dy / tangentLength;
        const perpY = tangent.dx / tangentLength;

        // Create jagged displacement with varying frequency and amplitude
        const time = progress * timeScale;
        const random1 = seededRandom(index * 1.234);
        const random2 = seededRandom(index * 5.678);
        const random3 = seededRandom(index * 9.012);

        const baseDisplacement =
          Math.sin(index * jaggedFrequency1 + time) * 0.6 +
          Math.sin(index * jaggedFrequency2 - time * 2) * 0.3 +
          Math.cos(index * jaggedFrequency3 + time * 1.5) * 0.1;

        const randomOffset =
          (random1 - 0.5) * 0.4 + (random2 - 0.5) * 0.3 + (random3 - 0.5) * 0.2;

        const displacement =
          baseDisplacement * (1 - randomness) + randomOffset * randomness;

        return {
          x: x + perpX * displacement * jaggedAmplitude,
          y: y + perpY * displacement * jaggedAmplitude,
          tangent,
        };
      }

      return {
        x,
        y,
        tangent,
      };
    });

    const totalPoints = transformedPath.length;
    const segmentLengthRatio = 0.5; // 50% of perimeter
    const segmentLength = Math.floor(totalPoints * segmentLengthRatio);

    // progress is 0 to 1, representing position around the perimeter
    const startIndex = Math.floor(progress * totalPoints) % totalPoints;

    // Extract the segment points
    const pathSegment: GeneratedPoints = [];
    for (let i = 0; i < segmentLength; i++) {
      const index = (startIndex + i) % totalPoints;
      pathSegment.push(transformedPath[index]);
    }

    return pathSegment;
  };

  const animate = useCallback(() => {
    setProgress((prev) => {
      const deltaSeconds = 1 / 60; // Frame-independent delta
      return (prev + deltaSeconds) % 1;
    });
  }, []);

  useTick(animate);

  const draw = (g: Graphics) => {
    g.clear();

    // Use cached corners, or get fresh ones during transition
    const corners = isTransitioning ? getFocusedRectCorners() : cachedCorners;
    if (!corners) return;

    const pathSegment = getBorderPathSegment(corners, progress);

    if (pathSegment.length < 2) return;

    // Draw the border line segment
    g.setStrokeStyle({
      width: lineWidth,
      color: boltColor,
      alpha: 1,
    });

    g.moveTo(pathSegment[0].x, pathSegment[0].y);
    for (let i = 1; i < pathSegment.length; i++) {
      g.lineTo(pathSegment[i].x, pathSegment[i].y);
    }
    g.stroke();
  };

  return <pixiGraphics draw={draw} filters={[glowFilter]} />;
}
