import { Graphics, PointData } from "pixi.js";

import { SVGCommand } from "./svgParser";
import { SVG_COMMAND_TYPES } from "./svgCommandTypes";

export type PointTransform = (x: number, y: number) => PointData;

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

    switch (cmd.type) {
      case SVG_COMMAND_TYPES.MOVE_TO:
      case SVG_COMMAND_TYPES.LINE_TO: {
        currentX = coords.x;
        currentY = coords.y;
        const p = transformPoint(coords.x, coords.y);
        return { ...cmd, coords: { x: p.x, y: p.y } };
      }

      case SVG_COMMAND_TYPES.HORIZ_LINE_TO: {
        currentX = coords.x;
        // Need both x and y for transform, convert to LINE_TO
        const p = transformPoint(currentX, currentY);
        return {
          ...cmd,
          type: SVG_COMMAND_TYPES.LINE_TO,
          coords: { x: p.x, y: p.y },
        };
      }

      case SVG_COMMAND_TYPES.VERT_LINE_TO: {
        currentY = coords.y;
        // Need both x and y for transform, convert to LINE_TO
        const p = transformPoint(currentX, currentY);
        return {
          ...cmd,
          type: SVG_COMMAND_TYPES.LINE_TO,
          coords: { x: p.x, y: p.y },
        };
      }

      case SVG_COMMAND_TYPES.CURVE_TO: {
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

      case SVG_COMMAND_TYPES.SMOOTH_CURVE_TO: {
        const p2 = transformPoint(coords.x2, coords.y2);
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return {
          ...cmd,
          coords: { x2: p2.x, y2: p2.y, x: p.x, y: p.y },
        };
      }

      case SVG_COMMAND_TYPES.QUAD_TO: {
        const cp = transformPoint(coords.x1, coords.y1);
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return {
          ...cmd,
          coords: { x1: cp.x, y1: cp.y, x: p.x, y: p.y },
        };
      }

      case SVG_COMMAND_TYPES.SMOOTH_QUAD_TO: {
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return { ...cmd, coords: { x: p.x, y: p.y } };
      }

      case SVG_COMMAND_TYPES.ARC: {
        const p = transformPoint(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        return {
          ...cmd,
          coords: { ...coords, x: p.x, y: p.y },
        };
      }

      case SVG_COMMAND_TYPES.CLOSE_PATH:
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

    switch (cmd.type) {
      case SVG_COMMAND_TYPES.MOVE_TO: {
        currentX = coords.x;
        currentY = coords.y;
        const p = transform(currentX, currentY);
        g.moveTo(p.x, p.y);
        break;
      }

      case SVG_COMMAND_TYPES.LINE_TO: {
        currentX = coords.x;
        currentY = coords.y;
        const p = transform(currentX, currentY);
        g.lineTo(p.x, p.y);
        break;
      }

      case SVG_COMMAND_TYPES.HORIZ_LINE_TO: {
        currentX = coords.x;
        const p = transform(currentX, currentY);
        g.lineTo(p.x, p.y);
        break;
      }

      case SVG_COMMAND_TYPES.VERT_LINE_TO: {
        currentY = coords.y;
        const p = transform(currentX, currentY);
        g.lineTo(p.x, p.y);
        break;
      }

      case SVG_COMMAND_TYPES.CURVE_TO: {
        const p1 = transform(coords.x1, coords.y1);
        const p2 = transform(coords.x2, coords.y2);
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p.x, p.y);
        break;
      }

      case SVG_COMMAND_TYPES.SMOOTH_CURVE_TO: {
        const p2 = transform(coords.x2, coords.y2);
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.bezierCurveTo(p2.x, p2.y, p2.x, p2.y, p.x, p.y);
        break;
      }

      case SVG_COMMAND_TYPES.QUAD_TO: {
        const cp = transform(coords.x1, coords.y1);
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.quadraticCurveTo(cp.x, cp.y, p.x, p.y);
        break;
      }

      case SVG_COMMAND_TYPES.SMOOTH_QUAD_TO: {
        const p = transform(coords.x, coords.y);
        currentX = coords.x;
        currentY = coords.y;
        g.lineTo(p.x, p.y);
        break;
      }

      case SVG_COMMAND_TYPES.ARC: {
        // Use pre-computed arc center and angles if available
        if (
          coords.cx !== undefined &&
          coords.cy !== undefined &&
          coords.startAngle !== undefined &&
          coords.endAngle !== undefined
        ) {
          const radius = coords.rX || 0;
          const center = transform(coords.cx, coords.cy);
          const startPoint = transform(currentX, currentY);
          const endPoint = transform(coords.x, coords.y);

          // Recalculate angles based on transformed points
          const actualStartAngle = Math.atan2(
            startPoint.y - center.y,
            startPoint.x - center.x
          );
          const actualEndAngle = Math.atan2(
            endPoint.y - center.y,
            endPoint.x - center.x
          );

          // Draw arc
          g.arc(
            center.x,
            center.y,
            radius,
            actualStartAngle,
            actualEndAngle,
            false
          );
        } else {
          // Fallback to line for arcs without pre-computed data
          const endPoint = transform(coords.x, coords.y);
          g.lineTo(endPoint.x, endPoint.y);
        }
        currentX = coords.x;
        currentY = coords.y;
        break;
      }

      case SVG_COMMAND_TYPES.CLOSE_PATH: {
        g.closePath();
        break;
      }
    }
  });
}
