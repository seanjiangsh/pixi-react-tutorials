/**
 * SVG Path Command Type Constants
 * These numeric values correspond to the command types defined in the svg-pathdata library.
 * We define them here to avoid importing the library in code that only needs to check command types.
 */

export const SVG_COMMAND_TYPES = {
  CLOSE_PATH: 1,
  MOVE_TO: 2,
  HORIZ_LINE_TO: 4,
  VERT_LINE_TO: 8,
  LINE_TO: 16,
  CURVE_TO: 32,
  SMOOTH_CURVE_TO: 64,
  QUAD_TO: 128,
  SMOOTH_QUAD_TO: 256,
  ARC: 512,
} as const;

export type SVGCommandType =
  (typeof SVG_COMMAND_TYPES)[keyof typeof SVG_COMMAND_TYPES];
