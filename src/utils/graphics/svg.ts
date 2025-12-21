import { Graphics } from "pixi.js";

import { SVGCommand } from "./svgParser";

export type PointTransform = (x: number, y: number) => { x: number; y: number };

/**
 * Draws an SVG path onto a PixiJS Graphics object using pre-parsed SVG commands
 * @param g - The PixiJS Graphics object to draw on
 * @param commands - The array of SVG commands (pre-parsed from an SVG path)
 * @param transformPoint - Optional function to transform points (e.g., for perspective)
 */
export function drawSVGPath(
  g: Graphics,
  commands: SVGCommand[],
  transformPoint?: PointTransform
): void {
  let currentX = 0;
  let currentY = 0;

  // Default identity transform if none provided
  const transform: PointTransform = transformPoint || ((x, y) => ({ x, y }));

  commands.forEach((cmd) => {
    const coords = cmd.coords;

    switch (cmd.typeName) {
      case "MOVE_TO": {
        currentX = coords.x;
        currentY = coords.y;
        const p = transform(currentX, currentY);
        g.moveTo(p.x, p.y);
        break;
      }

      case "LINE_TO": {
        currentX = coords.x;
        currentY = coords.y;
        const p = transform(currentX, currentY);
        g.lineTo(p.x, p.y);
        break;
      }

      case "HORIZ_LINE_TO": {
        currentX = coords.x;
        const p = transform(currentX, currentY);
        g.lineTo(p.x, p.y);
        break;
      }

      case "VERT_LINE_TO": {
        currentY = coords.y;
        const p = transform(currentX, currentY);
        g.lineTo(p.x, p.y);
        break;
      }

      case "CURVE_TO": {
        const p1 = transform(coords.x1, coords.y1);
        const p2 = transform(coords.x2, coords.y2);
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p.x, p.y);
        break;
      }

      case "SMOOTH_CURVE_TO": {
        const p2 = transform(coords.x2, coords.y2);
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.bezierCurveTo(p2.x, p2.y, p2.x, p2.y, p.x, p.y);
        break;
      }

      case "QUAD_TO": {
        const cp = transform(coords.x1, coords.y1);
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.quadraticCurveTo(cp.x, cp.y, p.x, p.y);
        break;
      }

      case "SMOOTH_QUAD_TO": {
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.lineTo(p.x, p.y);
        break;
      }

      case "ARC": {
        // Arc is complex, approximate with lines
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.lineTo(p.x, p.y);
        break;
      }

      case "CLOSE_PATH": {
        g.closePath();
        break;
      }
    }
  });
}
