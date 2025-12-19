import { useState, useEffect } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";

import borderSvgUrl from "./Betting-Grid-Border.svg?url";
extend({ Graphics });

export function GridBoardGfx() {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(borderSvgUrl)
      .then((res) => res.text())
      .then((text) => setSvgContent(text));
  }, []);

  return (
    <>
      {svgContent && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.svg(svgContent);
            console.log("drawn svg content");
          }}
        />
      )}
    </>
  );
}
