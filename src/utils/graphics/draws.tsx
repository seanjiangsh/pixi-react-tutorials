import { useCallback, useMemo } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import { KawaseBlurFilter } from "pixi-filters";

import { type ColorAlpha } from "src/types/types";

extend({ Graphics });

// Shared Layer Component with blur support
type LayerProps = ColorAlpha & {
  blurStrength: number;
  draw: (g: Graphics) => void;
};

export function BlurGfx(props: LayerProps) {
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
