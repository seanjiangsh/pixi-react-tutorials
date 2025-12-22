import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import { KawaseBlurFilter, GlowFilter } from "pixi-filters";

import { SVGPathData } from "src/utils/graphics/svgParser";
import { drawSVGPath } from "src/utils/graphics/svg";

extend({ Graphics });

interface GridCellGfxProps {
  pathData: SVGPathData;
  transformPoint: (x: number, y: number) => { x: number; y: number };
  strokeWidth: number;
  isHovered: boolean;
  isSelected: boolean;
  blur?: number;
  alpha?: number;
  glowDistance?: number;
  glowOuterStrength?: number;
  glowInnerStrength?: number;
  glowQuality?: number;
}

export function GridCellGfx(props: GridCellGfxProps) {
  const { pathData, transformPoint, strokeWidth } = props;
  const { isHovered, isSelected, blur = 0, alpha = 1 } = props;
  const {
    glowDistance = 0,
    glowOuterStrength = 0,
    glowInnerStrength = 0,
    glowQuality = 0,
  } = props;

  // Create filters
  const filters: (KawaseBlurFilter | GlowFilter)[] = [];

  if (blur > 0) {
    filters.push(
      new KawaseBlurFilter({
        strength: blur,
        pixelSize: { x: 0.5, y: 0.5 },
        quality: 10,
      })
    );
  }

  if (glowDistance > 0 || glowOuterStrength > 0) {
    filters.push(
      new GlowFilter({
        distance: glowDistance,
        outerStrength: glowOuterStrength,
        innerStrength: glowInnerStrength,
        quality: glowQuality,
        color: 0xffffff,
        knockout: true,
      })
    );
  }

  const drawPath = (g: Graphics) => {
    g.clear();

    // Set stroke style
    g.setStrokeStyle({
      width: strokeWidth,
      color: 0xffffff,
    });

    // Draw the path with perspective-transformed coordinates
    if (pathData.commands) {
      drawSVGPath(g, pathData.commands, transformPoint);
    }

    // Determine fill color and alpha
    let fillColor = 0x000000;
    let fillAlpha = 0;

    if (isSelected) {
      fillColor = 0x4caf50; // Green when selected
      fillAlpha = 0.6;
    } else if (isHovered) {
      fillColor = 0x2196f3; // Blue when hovered
      fillAlpha = 0.4;
    } else {
      // Always fill closed paths with transparent color for hit detection
      fillColor = 0x000000;
      fillAlpha = 0.01; // Nearly transparent but enables hit detection
    }

    g.fill({ color: fillColor, alpha: fillAlpha });

    // Stroke the path
    g.stroke();
  };

  return (
    <pixiGraphics
      alpha={alpha}
      filters={filters.length > 0 ? filters : []}
      draw={drawPath}
    />
  );
}
