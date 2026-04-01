import { useMemo, useState } from "react";
import { Graphics, Container, Text, TextStyle } from "pixi.js";
import { extend } from "@pixi/react";

import { ParsedSVG } from "src/utils/graphics/svgParser";
import { drawSVGPath } from "src/utils/graphics/svg";
import useSceneSize from "src/utils/hooks/useSceneSize";

extend({ Graphics, Container, Text });

type SVGParserGfxProps = {
  parsedSVG: ParsedSVG;
  showLabels: boolean;
};

export function SVGParserGfx(props: SVGParserGfxProps) {
  const { parsedSVG, showLabels } = props;
  const { width: canvasWidth, height: canvasHeight } = useSceneSize();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate scale to fit SVG in canvas
  const { scale, offsetX, offsetY } = useMemo(() => {
    const { width: svgWidth, height: svgHeight } = parsedSVG.dimensions;
    if (svgWidth === 0 || svgHeight === 0)
      return { scale: 1, offsetX: 0, offsetY: 0 };

    const scaleX = (canvasWidth * 0.8) / svgWidth;
    const scaleY = (canvasHeight * 0.8) / svgHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvasWidth - svgWidth * scale) / 2;
    const offsetY = (canvasHeight - svgHeight * scale) / 2;

    return { scale, offsetX, offsetY };
  }, [parsedSVG.dimensions, canvasWidth, canvasHeight]);

  return (
    <pixiContainer>
      {parsedSVG.paths.map((pathData, index) => {
        // Use the pre-calculated center point
        const centroidX = pathData.center?.x ?? 0;
        const centroidY = pathData.center?.y ?? 0;

        return (
          <pixiContainer key={index} x={offsetX} y={offsetY} scale={scale}>
            <pixiGraphics
              eventMode="static"
              cursor="pointer"
              onPointerEnter={() => setHoveredIndex(index)}
              onPointerLeave={() => setHoveredIndex(null)}
              draw={(g) => {
                g.clear();

                // Set default stroke style
                g.setStrokeStyle({
                  width: pathData.strokeWidth ?? 1,
                  color: 0xffffff,
                });

                // Draw using the utility function with pre-parsed commands
                if (pathData.commands) {
                  drawSVGPath(g, pathData.commands);
                }

                // Determine fill color and alpha
                let fillColor = 0x000000;
                let fillAlpha = 0;

                if (hoveredIndex === index) {
                  fillColor = 0x4caf50; // Green when hovered
                  fillAlpha = 0.5;
                } else {
                  // Always fill closed paths with transparent color for hit detection
                  fillColor = 0x000000;
                  fillAlpha = 0.01; // Nearly transparent but enables hit detection
                }

                g.fill({ color: fillColor, alpha: fillAlpha });
                g.stroke();
              }}
            />

            {/* Add numbered label at center */}
            {showLabels && (
              <pixiText
                text={index.toString()}
                x={centroidX}
                y={centroidY}
                anchor={{ x: 0.5, y: 0.5 }}
                style={
                  new TextStyle({
                    fontFamily: "Arial",
                    fontSize: 24,
                    fontWeight: "bold",
                    fill: 0xffffff,
                    stroke: { color: 0x000000, width: 4 },
                  })
                }
              />
            )}
          </pixiContainer>
        );
      })}
    </pixiContainer>
  );
}
