import { useCallback, useMemo } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import { KawaseBlurFilter } from "pixi-filters";
import { SVGPathData } from "svg-pathdata";

import { type ColorAlpha } from "src/types/types";

extend({ Graphics });

// Shared Layer Component with blur support
type LayerProps = ColorAlpha & {
  blurStrength: number;
  draw: (g: Graphics) => void;
};

export function BlurGfx(props: LayerProps) {
  const { color, alpha, blurStrength, draw } = props;

  const blurFilter = useMemo(
    () =>
      blurStrength > 0
        ? new KawaseBlurFilter({ strength: blurStrength, quality: 10 })
        : null,
    [blurStrength]
  );

  const drawGraphics = useCallback(
    (g: Graphics) => {
      g.clear();
      g.setFillStyle({ color, alpha });
      draw(g);
    },
    [color, alpha, draw]
  );

  const filters = blurFilter ? [blurFilter] : undefined;
  // return <pixiGraphics draw={drawGraphics} />;
  return <pixiGraphics draw={drawGraphics} filters={filters} />;
}

/**
 * Draws an SVG path onto a PixiJS Graphics object
 * @param g - The PixiJS Graphics object to draw on
 * @param pathString - The SVG path data string
 */
export function drawSVGPath(g: Graphics, pathString: string): void {
  // Parse the SVG path using svg-pathdata
  const pathParser = new SVGPathData(pathString);

  // Convert to absolute coordinates
  const absolutePath = pathParser.toAbs();

  // Draw the path
  let currentX = 0;
  let currentY = 0;

  absolutePath.commands.forEach((command) => {
    switch (command.type) {
      case SVGPathData.MOVE_TO:
        g.moveTo(command.x, command.y);
        currentX = command.x;
        currentY = command.y;
        break;

      case SVGPathData.LINE_TO:
        g.lineTo(command.x, command.y);
        currentX = command.x;
        currentY = command.y;
        break;

      case SVGPathData.HORIZ_LINE_TO:
        g.lineTo(command.x, currentY);
        currentX = command.x;
        break;

      case SVGPathData.VERT_LINE_TO:
        g.lineTo(currentX, command.y);
        currentY = command.y;
        break;

      case SVGPathData.CURVE_TO:
        g.bezierCurveTo(
          command.x1,
          command.y1,
          command.x2,
          command.y2,
          command.x,
          command.y
        );
        currentX = command.x;
        currentY = command.y;
        break;

      case SVGPathData.SMOOTH_CURVE_TO:
        // For smooth curve, we need the previous control point
        // This is a simplified version
        g.quadraticCurveTo(command.x2, command.y2, command.x, command.y);
        currentX = command.x;
        currentY = command.y;
        break;

      case SVGPathData.QUAD_TO:
        g.quadraticCurveTo(command.x1, command.y1, command.x, command.y);
        currentX = command.x;
        currentY = command.y;
        break;

      case SVGPathData.SMOOTH_QUAD_TO:
        g.lineTo(command.x, command.y);
        currentX = command.x;
        currentY = command.y;
        break;

      case SVGPathData.ARC:
        // Arc is complex, we can approximate with lines or use a library
        // For now, just draw a line to the end point
        g.lineTo(command.x, command.y);
        currentX = command.x;
        currentY = command.y;
        break;

      case SVGPathData.CLOSE_PATH:
        g.closePath();
        break;
    }
  });
}
