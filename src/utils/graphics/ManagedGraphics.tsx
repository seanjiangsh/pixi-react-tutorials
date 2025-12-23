import { useRef, useEffect, useCallback, useState } from "react";
import { Graphics, FillGradient, Filter, GradientOptions } from "pixi.js";
import { extend } from "@pixi/react";

extend({ Graphics });

// Generic filter configuration - accepts any Filter class with its options
export type FilterConfig<T extends Filter = Filter> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterClass: new (options?: any) => T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
};

interface ManagedGraphicsProps {
  draw: (g: Graphics) => void;
  gradient?: GradientOptions;
  filters?: FilterConfig[];
}

/**
 * A managed Graphics component that handles FillGradient and filter lifecycle.
 * Automatically destroys and recreates gradients and manages filters when their config changes.
 *
 * @important Always wrap gradient config and filters in useMemo to prevent unnecessary recreation
 * and PixiStats WebGL context errors. Reference comparison is used to detect changes.
 *
 * @example
 * ```tsx
 * const gradientConfig = useMemo(() => ({
 *   x0: 0, y0: 0, x1: 100, y1: 0,
 *   colorStops: [{ offset: 0, color: 0xff0000 }, { offset: 1, color: 0x0000ff }]
 * }), []);
 *
 * const filters = useMemo(() => [
 *   { filterClass: BlurFilter, options: { strength: 5 } },
 *   { filterClass: AlphaFilter, options: { alpha: 0.5 } }
 * ], []);
 *
 * <ManagedGraphics
 *   draw={drawCallback}
 *   gradient={gradientConfig}
 *   filters={filters}
 * />
 * ```
 */
export function ManagedGraphics(props: ManagedGraphicsProps) {
  const { draw, gradient, filters, ...remainedprops } = props;
  const gradientRef = useRef<FillGradient | null>(null);
  const filtersRef = useRef<Filter[] | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Filter[] | undefined>(
    undefined
  );
  const prevGradientRef = useRef<GradientOptions | undefined>(undefined);
  const prevFiltersRef = useRef<FilterConfig[] | undefined>(undefined);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gradientRef.current) {
        gradientRef.current.destroy();
        gradientRef.current = null;
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
      /** Gradient Management */
      if (gradient !== prevGradientRef.current) {
        // Destroy old gradient
        if (gradientRef.current) {
          gradientRef.current.destroy();
          gradientRef.current = null;
        }

        // Create new gradient if config provided
        if (gradient) gradientRef.current = new FillGradient(gradient);

        prevGradientRef.current = gradient;
      }

      // Apply gradient before drawing
      if (gradientRef.current) {
        g.setFillStyle(gradientRef.current);
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

      // Call original draw function
      draw(g);
    },
    [draw, gradient, filters]
  );

  return (
    <pixiGraphics
      draw={wrappedDraw}
      filters={currentFilters}
      {...remainedprops}
    />
  );
}
