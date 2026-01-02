import { Graphics } from "pixi.js";

import { SVGCommand } from "./svgParser";

export type PointTransform = (x: number, y: number) => { x: number; y: number };

/**
 * Transforms all points in SVG commands array using the provided transform function
 * @param commands - The array of SVG commands to transform
 * @param transformPoint - Function to transform each point
 * @returns New array of transformed SVG commands
 */
export function transformSVGCommands(
  commands: SVGCommand[],
  transformPoint: PointTransform
): SVGCommand[] {
  let currentX = 0;
  let currentY = 0;

  return commands.map((cmd) => {
    const coords = { ...cmd.coords };

    switch (cmd.typeName) {
      case "MOVE_TO":
      case "LINE_TO": {
        currentX = coords.x;
        currentY = coords.y;
        const p = transformPoint(coords.x, coords.y);
        return { ...cmd, coords: { x: p.x, y: p.y } };
      }

      case "HORIZ_LINE_TO": {
        currentX = coords.x;
        // Need both x and y for transform, convert to LINE_TO
        const p = transformPoint(currentX, currentY);
        return { ...cmd, typeName: "LINE_TO", coords: { x: p.x, y: p.y } };
      }

      case "VERT_LINE_TO": {
        currentY = coords.y;
        // Need both x and y for transform, convert to LINE_TO
        const p = transformPoint(currentX, currentY);
        return { ...cmd, typeName: "LINE_TO", coords: { x: p.x, y: p.y } };
      }

      case "CURVE_TO": {
        const p1 = transformPoint(coords.x1, coords.y1);
        const p2 = transformPoint(coords.x2, coords.y2);
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return {
          ...cmd,
          coords: {
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y,
            x: p.x,
            y: p.y,
          },
        };
      }

      case "SMOOTH_CURVE_TO": {
        const p2 = transformPoint(coords.x2, coords.y2);
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return {
          ...cmd,
          coords: { x2: p2.x, y2: p2.y, x: p.x, y: p.y },
        };
      }

      case "QUAD_TO": {
        const cp = transformPoint(coords.x1, coords.y1);
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return {
          ...cmd,
          coords: { x1: cp.x, y1: cp.y, x: p.x, y: p.y },
        };
      }

      case "SMOOTH_QUAD_TO": {
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return { ...cmd, coords: { x: p.x, y: p.y } };
      }

      case "ARC": {
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return {
          ...cmd,
          coords: { ...coords, x: p.x, y: p.y },
        };
      }

      case "CLOSE_PATH":
        return cmd;

      default:
        return cmd;
    }
  });
}

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
