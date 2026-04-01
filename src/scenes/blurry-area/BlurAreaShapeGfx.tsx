import { useCallback, useMemo } from "react";
import {
  Graphics,
  FederatedPointerEvent,
  GradientOptions,
  Container,
} from "pixi.js";
import { extend } from "@pixi/react";
import { ManagedGraphics } from "src/utils/graphics/ManagedGraphics";

extend({ Container });

interface BlurAreaShapeGfxProps {
  id: number;
  x: number;
  y: number;
  radius: number;
  gradient: {
    type: "radial" | "linear";
    colorStops: Array<{ offset: number; color: string }>;
  };
  shapeType: "circle" | "rect";
  isDragging: boolean;
  onPointerDown: (
    id: number,
    x: number,
    y: number,
    e: FederatedPointerEvent,
  ) => void;
}

export function BlurAreaShapeGfx({
  id,
  x,
  y,
  radius,
  gradient,
  shapeType,
  isDragging,
  onPointerDown,
}: BlurAreaShapeGfxProps) {
  // Create gradient configuration for ManagedGraphics
  const gradientConfig: GradientOptions = useMemo(() => {
    if (gradient.type === "radial") {
      return {
        type: "radial" as const,
        x0: 0,
        y0: 0,
        r0: 0,
        x1: 0,
        y1: 0,
        r1: radius,
        colorStops: gradient.colorStops,
      };
    } else {
      return {
        type: "linear" as const,
        x0: -radius,
        y0: -radius,
        x1: radius,
        y1: radius,
        colorStops: gradient.colorStops,
      };
    }
  }, [gradient, radius]);

  // Draw shape (circle or rect)
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      if (shapeType === "circle") {
        g.circle(0, 0, radius);
      } else {
        // Draw rounded rectangle
        const size = radius * 1.8;
        g.roundRect(-size / 2, -size / 2, size, size, radius * 0.2);
      }
      g.fill();
    },
    [radius, shapeType],
  );

  // Handle pointer down - delegate to parent
  const handlePointerDown = useCallback(
    (e: FederatedPointerEvent) => {
      onPointerDown(id, x, y, e);
    },
    [id, x, y, onPointerDown],
  );

  return (
    <pixiContainer
      x={x}
      y={y}
      eventMode="static"
      cursor={isDragging ? "grabbing" : "pointer"}
      onPointerDown={handlePointerDown}
    >
      <ManagedGraphics draw={draw} fillGradient={gradientConfig} />
    </pixiContainer>
  );
}
