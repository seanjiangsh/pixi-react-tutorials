import { useCallback } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";

import { SVGPathData } from "src/utils/graphics/svgParser";
import { drawSVGPath } from "src/utils/graphics/svg";

extend({ Graphics });

interface GridCellGfxProps {
  pathData: SVGPathData;
  transformPoint?: (x: number, y: number) => { x: number; y: number };
  strokeWidth: number;
  isHovered: boolean;
}

export function GridCellGfx(props: GridCellGfxProps) {
  const { pathData, transformPoint, strokeWidth } = props;
  const { isHovered } = props;

  const drawPath = useCallback(
    (g: Graphics) => {
      g.clear();

      // Set stroke style
      g.setStrokeStyle({
        width: strokeWidth,
        color: 0xffffff,
      });

      // Draw the path - expects pre-transformed commands from parent
      // transformPoint is optional and only used if path data is not pre-transformed
      if (pathData.commands) {
        drawSVGPath(g, pathData.commands, transformPoint);
      }

      // Determine fill color and alpha
      let fillColor = 0x000000;
      let fillAlpha = 0;

      if (isHovered) {
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
    },
    [pathData, transformPoint, strokeWidth, isHovered]
  );

  return <pixiGraphics draw={drawPath} />;
}
