import { useRef, useEffect, useCallback, useState } from "react";
import {
  Graphics,
  FillGradient,
  Filter,
  GradientOptions,
  FilterOptions,
} from "pixi.js";
import { extend } from "@pixi/react";

extend({ Graphics });

// Generic filter configuration - accepts any Filter class with its options
export type FilterConfig<T extends Filter = Filter> = {
  filterClass: new (options?: FilterOptions) => T;
  options?: FilterOptions;
};

interface ManagedGraphicsProps {
  draw: (g: Graphics) => void;
  fillGradient?: GradientOptions;
  strokeGradient?: GradientOptions;
  filters?: FilterConfig[];
}

/**
 * A managed Graphics component that handles FillGradient and filter lifecycle.
 * Automatically destroys and recreates gradients and manages filters when their config changes.
 *
 * @important Always wrap gradient config and filters in useMemo to prevent unnecessary recreation
 * and PixiStats WebGL context errors. Reference comparison is used to detect changes.
 *
 * @important When using strokeGradient, you must spread the existing strokeStyle to preserve the
 * gradient fill that was automatically applied. Use: `g.setStrokeStyle({ ...g.strokeStyle, width: 2, color: 0xff0000 })`
 *
 * @example
 * ```tsx
 * const fillGradientConfig = useMemo(() => ({
 *   x0: 0, y0: 0, x1: 100, y1: 0,
 *   colorStops: [{ offset: 0, color: 0xff0000 }, { offset: 1, color: 0x0000ff }]
 * }), []);
 *
 * const filters = useMemo(() => [
 *   { filterClass: BlurFilter, options: { strength: 5 } },
 *   { filterClass: AlphaFilter, options: { alpha: 0.5 } }
 * ], []);
 *
 * const strokeGradientConfig = useMemo(() => ({
 *   type: 'linear',
 *   start: { x: 0, y: 0 },
 *   end: { x: 1, y: 0 },
 *   colorStops: [{ offset: 0, color: 0xffffff }, { offset: 1, color: 0x0000ff }]
 * }), []);
 *
 * // Draw function using strokeGradient
 * const drawStroke = useCallback((g: Graphics) => {
 *   g.clear();
 *   // IMPORTANT: Spread g.strokeStyle to preserve the gradient fill
 *   g.setStrokeStyle({ ...g.strokeStyle, width: 2, color: 0x2ecc71 });
 *   g.moveTo(0, 0);
 *   g.lineTo(100, 100);
 *   g.stroke();
 * }, []);
 *
 * <ManagedGraphics
 *   draw={drawCallback}
 *   fillGradient={fillGradientConfig}
 *   strokeGradient={strokeGradientConfig}
 *   filters={filters}
 * />
 * ```
 */
export function ManagedGraphics(props: ManagedGraphicsProps) {
  const { draw, fillGradient, strokeGradient, filters, ...remainedprops } =
    props;
  const fillGradientRef = useRef<FillGradient | null>(null);
  const strokeGradientRef = useRef<FillGradient | null>(null);
  const filtersRef = useRef<Filter[] | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Filter[] | undefined>(
    undefined
  );
  const prevFillGradientRef = useRef<GradientOptions | undefined>(undefined);
  const prevStrokeGradientRef = useRef<GradientOptions | undefined>(undefined);
  const prevFiltersRef = useRef<FilterConfig[] | undefined>(undefined);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fillGradientRef.current) {
        fillGradientRef.current.destroy();
        fillGradientRef.current = null;
      }
      if (strokeGradientRef.current) {
        strokeGradientRef.current.destroy();
        strokeGradientRef.current = null;
      }
      if (filtersRef.current) {
        filtersRef.current.forEach((f) => f.destroy());
        filtersRef.current = null;
      }
    };
  }, []);

  // Wrap the draw function to manage gradient and filter lifecycle
  const wrappedDraw = useCallback(
    (g: Graphics) => {
      /** Fill Gradient Management */
      if (fillGradient !== prevFillGradientRef.current) {
        // Destroy old fill gradient
        if (fillGradientRef.current) {
          fillGradientRef.current.destroy();
          fillGradientRef.current = null;
        }

        // Create new fill gradient if config provided
        if (fillGradient)
          fillGradientRef.current = new FillGradient(fillGradient);

        prevFillGradientRef.current = fillGradient;
      }

      /** Stroke Gradient Management */
      if (strokeGradient !== prevStrokeGradientRef.current) {
        // Destroy old stroke gradient
        if (strokeGradientRef.current) {
          strokeGradientRef.current.destroy();
          strokeGradientRef.current = null;
        }

        // Create new stroke gradient if config provided
        if (strokeGradient)
          strokeGradientRef.current = new FillGradient(strokeGradient);

        prevStrokeGradientRef.current = strokeGradient;
      }

      // Apply gradients before drawing
      if (fillGradientRef.current) {
        g.setFillStyle(fillGradientRef.current);
      }
      if (strokeGradientRef.current) {
        g.setStrokeStyle({ fill: strokeGradientRef.current });
      }

      /** Filters Management */
      if (filters !== prevFiltersRef.current) {
        // Destroy old filters
        if (filtersRef.current) {
          filtersRef.current.forEach((f) => f.destroy());
          filtersRef.current = null;
        }

        // Create new filters from config
        if (filters) {
          const newFilters = filters.map((config) => {
            return new config.filterClass(config.options);
          });
          filtersRef.current = newFilters;
          setCurrentFilters(newFilters);
        } else {
          setCurrentFilters(undefined);
        }

        prevFiltersRef.current = filters;
      }

      // Call original draw function with gradient refs available in closure
      draw(g);
    },
    [draw, fillGradient, strokeGradient, filters]
  );

  return (
    <pixiGraphics
      draw={wrappedDraw}
      filters={currentFilters}
      {...remainedprops}
    />
  );
}
