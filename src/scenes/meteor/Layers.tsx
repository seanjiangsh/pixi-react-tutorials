import { useCallback, useMemo } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import { KawaseBlurFilter } from "pixi-filters";

extend({ Graphics });

// Shared Layer Component for both circles and rectangles
type LayerProps = {
  color: number;
  alpha: number;
  blurStrength: number;
  draw: (g: Graphics) => void;
};

export function Layer(props: LayerProps) {
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

// Combined Meteor Layer (semicircle head + triangle tail in one graphic)
export type MeteorShapeLayerProps = {
  circleRadius: number;
  tailLength: number;
  color: number;
  alpha: number;
  blurStrength: number;
};

export function MeteorShapeLayer(props: MeteorShapeLayerProps) {
  const { circleRadius, tailLength, color, alpha, blurStrength } = props;

  const draw = useCallback(
    (g: Graphics) => {
      // Start from top of the semicircle
      g.moveTo(0, -circleRadius);

      // Draw the semicircle arc (right half) - clockwise from top to bottom
      g.arc(0, 0, circleRadius, -Math.PI / 2, Math.PI / 2, false);

      // Now at bottom of semicircle (0, circleRadius)
      // Draw tail triangle back
      g.lineTo(-tailLength, 0);

      // Complete the triangle back to top
      g.lineTo(0, -circleRadius);

      g.fill();
    },
    [circleRadius, tailLength]
  );

  return (
    <Layer
      color={color}
      alpha={alpha}
      blurStrength={blurStrength}
      draw={draw}
    />
  );
}
