import { useMemo, useCallback, useState } from "react";
import {
  Graphics,
  BlurFilter,
  FilterOptions,
  Container,
  GradientOptions,
} from "pixi.js";
import { extend } from "@pixi/react";
// import { KawaseBlurFilter } from "pixi-filters";

import { SVGPathData } from "src/utils/graphics/svgParser";
import { drawSVGPath } from "src/utils/graphics/svg";
import {
  ManagedGraphics,
  FilterConfig,
} from "src/utils/graphics/ManagedGraphics";

extend({ Container, Graphics });

interface GridCellShadowGfxProps {
  pathData: SVGPathData;
  transformedPathData: SVGPathData;
  transformPoint: (x: number, y: number) => { x: number; y: number };
  gradientType: "linear" | "concentric";
  lineCount: number;
  extendDistance: number;
  colorStart: string;
  colorEnd: string;
  blur: number;
  opacity: number;
  type?: "inner" | "outer";
}

/**
 * Renders a shadow effect for a grid cell by drawing multiple offset lines
 * that gradually fade towards/away from the center, creating a soft shadow following the cell outline.
 *
 * @param type - "inner" renders shadow inside the cell, "outer" renders shadow outside
 * @param useMask - When true, masks the shadow to prevent blur overflow (inner won't show outside, outer won't show inside)
 */
export function GridCellShadowGfx(props: GridCellShadowGfxProps) {
  const {
    pathData,
    transformedPathData,
    transformPoint,
    gradientType,
    lineCount,
    extendDistance,
    colorStart,
    colorEnd,
    blur,
    opacity,
    type = "inner",
  } = props;

  const [maskGraphics, setMaskGraphics] = useState<Graphics | null>(null);

  // Configure blur filter
  // const filters = useMemo<FilterConfig[] | undefined>(() => {
  //   if (blur > 0) {
  //     return [
  //       {
  //         filterClass: KawaseBlurFilter,
  //         options: { strength: blur, quality: 10 } as FilterOptions,
  //       },
  //     ];
  //   }
  //   return undefined;
  // }, [blur]);

  const filters = useMemo<FilterConfig[] | undefined>(() => {
    if (blur > 0) {
      return [
        {
          filterClass: BlurFilter,
          options: { strength: blur } as FilterOptions,
        },
      ];
    }
    return undefined;
  }, [blur]);

  // Helper function to interpolate between two colors
  const interpolateColor = useCallback(
    (color1: string, color2: string, factor: number): number => {
      // Convert hex colors to RGB
      const c1 = parseInt(color1.replace("#", ""), 16);
      const c2 = parseInt(color2.replace("#", ""), 16);

      const r1 = (c1 >> 16) & 0xff;
      const g1 = (c1 >> 8) & 0xff;
      const b1 = c1 & 0xff;

      const r2 = (c2 >> 16) & 0xff;
      const g2 = (c2 >> 8) & 0xff;
      const b2 = c2 & 0xff;

      // Interpolate
      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);

      return (r << 16) | (g << 8) | b;
    },
    []
  );

  // Create stroke gradient configuration for linear gradient
  const strokeGradient = useMemo<GradientOptions | undefined>(
    () =>
      gradientType === "linear"
        ? {
            type: "linear",
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
            colorStops: [
              { offset: 0, color: colorStart },
              { offset: 1, color: colorEnd },
            ],
          }
        : undefined,
    [gradientType, colorStart, colorEnd]
  );

  // Draw function that creates multiple offset lines for the shadow effect
  const drawShadow = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!pathData.commands) return;

      const isInner = type === "inner";

      // Draw multiple lines at different offsets for gradient effect
      for (let i = 0; i <= lineCount; i++) {
        // Calculate alpha fade
        const alphaNormalized = 1 - i / lineCount;
        const lineAlpha = alphaNormalized * opacity;

        // Calculate offset distance (start after the border)
        const offsetDistance = (i / lineCount) * extendDistance;

        // Set stroke style with fading alpha
        if (gradientType === "linear") {
          // Linear gradient: spread strokeStyle to preserve gradient fill from ManagedGraphics
          g.setStrokeStyle({
            ...g.strokeStyle,
            width: 1,
            alpha: lineAlpha,
          });
        } else {
          // Concentric gradient: interpolate color for each layer
          const colorFactor = i / lineCount;
          const layerColor = interpolateColor(
            colorStart,
            colorEnd,
            colorFactor
          );
          g.setStrokeStyle({
            width: 1,
            color: layerColor,
            alpha: lineAlpha,
          });
        }

        // Create an offset transformation function
        const offsetTransform = (x: number, y: number) => {
          // Calculate offset in transformed space for uniform visual appearance
          if (!pathData.center) return transformPoint(x, y);

          // Transform the current point and center to screen space
          const transformedPoint = transformPoint(x, y);
          const transformedCenter = transformPoint(
            pathData.center.x,
            pathData.center.y
          );

          // Calculate direction in transformed space
          const dx = transformedCenter.x - transformedPoint.x;
          const dy = transformedCenter.y - transformedPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance === 0) return transformedPoint;

          // Normalize direction in screen space
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Apply offset: inward for inner shadow, outward for outer shadow
          const sign = isInner ? 1 : -1;
          const offsetX = dirX * offsetDistance * sign;
          const offsetY = dirY * offsetDistance * sign;

          // Return the offset point in screen space
          return {
            x: transformedPoint.x + offsetX,
            y: transformedPoint.y + offsetY,
          };
        };

        // Draw the offset path
        drawSVGPath(g, pathData.commands, offsetTransform);
        g.stroke();
      }
    },
    [
      pathData,
      transformPoint,
      lineCount,
      extendDistance,
      opacity,
      type,
      gradientType,
      colorStart,
      colorEnd,
      interpolateColor,
    ]
  );

  // Draw mask path using pre-transformed coordinates
  const drawMask = useCallback(
    (g: Graphics) => {
      g.clear();
      if (!transformedPathData.commands || !transformedPathData.bounds) return;

      const isInner = type === "inner";

      if (isInner) {
        // Inner shadow: mask to cell boundary
        drawSVGPath(g, transformedPathData.commands);
        g.fill({ color: 0xffffff });
      } else {
        // Outer shadow: create inverse mask (show everything except cell)
        const bounds = transformedPathData.bounds;
        const padding = extendDistance * 20;

        // Draw a large rectangle
        g.rect(
          bounds.x - padding,
          bounds.y - padding,
          bounds.width + padding * 2,
          bounds.height + padding * 2
        );
        g.fill({ color: 0xffffff });

        // Cut out the cell shape to create a hole
        drawSVGPath(g, transformedPathData.commands);
        g.cut();
      }
    },
    [transformedPathData, type, extendDistance]
  );

  // Both inner and outer shadows use masking
  return (
    <pixiContainer>
      {/* Mask graphics - rendered but acts as clipping region */}
      <pixiGraphics
        draw={drawMask}
        ref={(ref: Graphics | null) => setMaskGraphics(ref)}
      />
      {/* Shadow graphics with mask applied */}
      <ManagedGraphics
        draw={drawShadow}
        filters={filters}
        stroke={strokeGradient}
        mask={maskGraphics}
      />
    </pixiContainer>
  );
}
