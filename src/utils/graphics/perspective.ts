import { PointData } from "pixi.js";

/**
 * Configuration for perspective transformation
 */
export interface PerspectiveConfig {
  /** Tilt amount (-1 to 1, where negative tilts toward center at top) */
  tilt: number;
  /** Pivot point (0 = top, 1 = bottom) where the perspective rotation occurs */
  pivot: number;
  /** Reference dimensions for calculating perspective */
  reference: {
    /** Reference width for calculating distance from center */
    width: number;
    /** Reference height for calculating pivot position */
    height: number;
  };
  /** Optional intensity factors for perspective effect */
  factors?: {
    /** Skew intensity factor (default: 0.5) */
    skew?: number;
    /** Scale reduction factor (default: 0.3) */
    scale?: number;
  };
  /** Optional scale for x and y axes */
  boardScale?: {
    x: number;
    y: number;
  };
}

/**
 * Configuration for scale transformation with anchor point
 */
export interface ScaleConfig {
  /** Scale point for x and y axes */
  point: PointData;
  /** Anchor point for scaling origin */
  anchor: { x: "left" | "right"; y: "top" | "bottom" };
}

/**
 * Helper function to calculate perspective transformation values
 * @internal
 */
function calcPerspectiveValues(
  x: number,
  perspective: PerspectiveConfig
): { distanceFromCenter: number; skewBase: number; scaleY: number } {
  const centerX = perspective.reference.width / 2;
  const distanceFromCenter = (x - centerX) / (perspective.reference.width / 2);

  const skewFactor = perspective.factors?.skew ?? 0.5;
  const scaleFactor = perspective.factors?.scale ?? 0.3;

  const skewBase = distanceFromCenter * perspective.tilt * skewFactor;
  const scaleY = 1 - Math.abs(perspective.tilt) * scaleFactor;

  return { distanceFromCenter, skewBase, scaleY };
}

/**
 * Applies perspective transformation and position shift to a 2D point
 *
 * @param x - X coordinate to transform
 * @param y - Y coordinate to transform
 * @param perspective - Perspective transformation configuration (optional)
 * @param shift - Position shift configuration (optional)
 * @param scale - Scale configuration with point and anchor (optional)
 * @returns Transformed point with x and y coordinates
 *
 * @example
 * ```ts
 * const transformed = applyPerspectiveTransform(
 *   100, 200,
 *   {
 *     tilt: 0.5,
 *     pivot: 0.8,
 *     reference: { width: 800, height: 600 }
 *   },
 *   { x: 10, y: -20 },
 *   {
 *     point: { x: 1.5, y: 1.5 },
 *     anchor: { x: 'left', y: 'top' }
 *   }
 * );
 * ```
 */
export function applyPerspectiveTransform(
  x: number,
  y: number,
  perspective?: PerspectiveConfig,
  shift?: PointData,
  scale?: ScaleConfig
): PointData {
  let transformedX = x;
  let transformedY = y;

  // Apply perspective transformation if provided and tilt is non-zero
  if (perspective && perspective.tilt !== 0) {
    const { skewBase, scaleY } = calcPerspectiveValues(x, perspective);

    // Calculate pivot point position
    const pivotY = perspective.reference.height * perspective.pivot;
    const yFromPivot = y - pivotY;

    // Apply perspective transformations
    // Negative sign on skewAmount creates the "/ | \" effect:
    // - Left points (distanceFromCenter < 0): positive skew → tilt right
    // - Right points (distanceFromCenter > 0): negative skew → tilt left
    const skewAmount = -skewBase;

    // Apply transformations relative to pivot
    transformedX = x - yFromPivot * skewAmount;
    transformedY = pivotY + yFromPivot * scaleY;
  }

  // Apply scale if provided
  if (scale && perspective) {
    const { reference } = perspective;

    // Calculate anchor positions
    const anchorX = scale.anchor.x === "right" ? reference.width : 0;
    const anchorY = scale.anchor.y === "bottom" ? reference.height : 0;

    // Apply scale relative to anchor point
    transformedX = anchorX + (transformedX - anchorX) * scale.point.x;
    transformedY = anchorY + (transformedY - anchorY) * scale.point.y;
  } else if (scale) {
    // If no perspective config, apply scale from origin
    transformedX *= scale.point.x;
    transformedY *= scale.point.y;
  }

  // Apply position shift if provided
  if (shift) {
    transformedX += shift.x;
    transformedY += shift.y;
  }

  return { x: transformedX, y: transformedY };
}

/**
 * Creates a transform function with preset perspective and shift configurations
 * Useful for transforming multiple points with the same settings
 *
 * @param perspective - Perspective transformation configuration (optional)
 * @param shift - Position shift configuration (optional)
 * @param scale - Scale configuration with point and anchor (optional)
 * @returns Function that transforms a point using the preset configuration
 *
 * @example
 * ```ts
 * const transformer = createPerspectiveTransformer(
 *   { tilt: 0.5, pivot: 0.8, reference: { width: 800, height: 600 } },
 *   { x: 10, y: -20 },
 *   {
 *     point: { x: 1.5, y: 1.5 },
 *     anchor: { x: 'left', y: 'top' }
 *   }
 * );
 *
 * const point1 = transformer(100, 200);
 * const point2 = transformer(300, 400);
 * ```
 */
export function createPerspectiveTransformer(
  perspective?: PerspectiveConfig,
  shift?: PointData,
  scale?: ScaleConfig
): (x: number, y: number) => PointData {
  return (x: number, y: number) =>
    applyPerspectiveTransform(x, y, perspective, shift, scale);
}

/**
 * Calculates the skew and scale values for texture transformation based on perspective
 * Useful for applying consistent transformations to textures, text, or other objects that match the cell perspective
 *
 * @param centerX - X coordinate of the texture center
 * @param perspective - Perspective transformation configuration (optional)
 * @returns Object with skewX and scaleY values for texture transformation
 */
export function calcTransform(
  centerX: number,
  perspective?: PerspectiveConfig
): { skewX: number; scaleY: number } {
  if (!perspective || perspective.tilt === 0) {
    return { skewX: 0, scaleY: 1 };
  }

  const { skewBase, scaleY } = calcPerspectiveValues(centerX, perspective);

  // For text, use positive skew (opposite of point transformation)
  return { skewX: skewBase, scaleY };
}
