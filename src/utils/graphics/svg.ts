import { Graphics } from "pixi.js";
import { SVGCommand } from "./svgParser";
import { SVGPathData as SVGPathDataParser } from "svg-pathdata";

/**
 * Draws an SVG path onto a PixiJS Graphics object using pre-parsed SVG commands
 * @param g - The PixiJS Graphics object to draw on
 * @param commands - The array of SVG commands (pre-parsed from an SVG path)
 */
export function drawSVGPath(g: Graphics, commands: SVGCommand[]): void {
  let currentX = 0;
  let currentY = 0;

  // Map of command type numbers
  const MOVE_TO = SVGPathDataParser.MOVE_TO.toString();
  const LINE_TO = SVGPathDataParser.LINE_TO.toString();
  const HORIZ_LINE_TO = SVGPathDataParser.HORIZ_LINE_TO.toString();
  const VERT_LINE_TO = SVGPathDataParser.VERT_LINE_TO.toString();
  const CURVE_TO = SVGPathDataParser.CURVE_TO.toString();
  const SMOOTH_CURVE_TO = SVGPathDataParser.SMOOTH_CURVE_TO.toString();
  const QUAD_TO = SVGPathDataParser.QUAD_TO.toString();
  const SMOOTH_QUAD_TO = SVGPathDataParser.SMOOTH_QUAD_TO.toString();
  const ARC = SVGPathDataParser.ARC.toString();
  const CLOSE_PATH = SVGPathDataParser.CLOSE_PATH.toString();

  commands.forEach((command) => {
    switch (command.type) {
      case MOVE_TO:
        g.moveTo(command.coords.x, command.coords.y);
        currentX = command.coords.x;
        currentY = command.coords.y;
        break;

      case LINE_TO:
        g.lineTo(command.coords.x, command.coords.y);
        currentX = command.coords.x;
        currentY = command.coords.y;
        break;

      case HORIZ_LINE_TO:
        g.lineTo(command.coords.x, currentY);
        currentX = command.coords.x;
        break;

      case VERT_LINE_TO:
        g.lineTo(currentX, command.coords.y);
        currentY = command.coords.y;
        break;

      case CURVE_TO:
        g.bezierCurveTo(
          command.coords.x1,
          command.coords.y1,
          command.coords.x2,
          command.coords.y2,
          command.coords.x,
          command.coords.y
        );
        currentX = command.coords.x;
        currentY = command.coords.y;
        break;

      case SMOOTH_CURVE_TO:
        // For smooth curve, we need the previous control point
        // This is a simplified version using quadratic curve
        g.quadraticCurveTo(
          command.coords.x2,
          command.coords.y2,
          command.coords.x,
          command.coords.y
        );
        currentX = command.coords.x;
        currentY = command.coords.y;
        break;

      case QUAD_TO:
        g.quadraticCurveTo(
          command.coords.x1,
          command.coords.y1,
          command.coords.x,
          command.coords.y
        );
        currentX = command.coords.x;
        currentY = command.coords.y;
        break;

      case SMOOTH_QUAD_TO:
        g.lineTo(command.coords.x, command.coords.y);
        currentX = command.coords.x;
        currentY = command.coords.y;
        break;

      case ARC:
        // Arc is complex, approximate with lines
        g.lineTo(command.coords.x, command.coords.y);
        currentX = command.coords.x;
        currentY = command.coords.y;
        break;

      case CLOSE_PATH:
        g.closePath();
        break;
    }
  });
}
