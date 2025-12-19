import { useState, useEffect } from "react";
import { Assets, Graphics, Sprite, Texture } from "pixi.js";
import { extend } from "@pixi/react";

import borderSvgUrl from "./Betting-Grid-Border.svg";
import borderSvgOriginalUrl from "./Betting-Grid-Border-original.svg";
import useSceneSize from "src/utils/hooks/useSceneSize";
extend({ Graphics, Sprite, Texture });

export function GridBoardGfx() {
  const { width, height } = useSceneSize();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [spriteReady, setSpriteReady] = useState(false);

  useEffect(() => {
    fetch(borderSvgUrl)
      .then((res) => res.text())
      .then((text) => setSvgContent(text));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Assets.load(borderSvgOriginalUrl)
      .then(() => {
        if (!cancelled) setSpriteReady(true);
      })
      .catch(() => {
        if (!cancelled) setSpriteReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only render one method at a time for clarity. Uncomment the one you want to use.
  return (
    <>
      {/* SVG as vector graphics (recommended for SVG): */}
      {svgContent && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.svg(svgContent);
          }}
        />
      )}

      {/* SVG as sprite (rasterized): */}
      {/* {spriteReady && (
        <pixiSprite texture={Texture.from(borderSvgOriginalUrl)} />
      )} */}
    </>
  );
}
