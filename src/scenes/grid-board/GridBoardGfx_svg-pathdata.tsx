import { useState, useEffect } from "react";
import { Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import { SVGPathData } from "svg-pathdata";

// import originalBorderSvgUrl from "./Betting-Grid-Border.svg?url";
import borderSvgUrl from "./Betting-Grid-Border.svg";

import {
  fetchAndParseSVG,
  type SVGPathData as SVGPath,
  type SVGDimensions,
} from "src/utils/graphics/svgParser";

extend({ Graphics });

export function GridBoardGfx_svgPathdata() {
  const [svgPaths, setSvgPaths] = useState<SVGPath[]>([]);
  const [svgDimensions, setSvgDimensions] = useState<SVGDimensions>({
    width: 0,
    height: 0,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAndParseSVG(borderSvgUrl).then(({ paths, dimensions }) => {
      console.log("📊 Parsed SVG data:", {
        totalPaths: paths.length,
        closedPaths: paths.filter((p) => p.isClosed).length,
        dimensions,
      });
      paths.forEach((path, i) => {
        console.log(`Path ${i}:`, {
          isClosed: path.isClosed,
          bounds: path.bounds,
          stroke: path.stroke,
        });
      });
      setSvgPaths(paths);
      setSvgDimensions(dimensions);
    });
  }, []);

  return (
    <>
      {svgPaths.map((pathData, index) => (
        <pixiGraphics
          key={index}
          x={-svgDimensions.width / 2}
          y={-svgDimensions.height / 2}
          eventMode={pathData.isClosed ? "static" : "none"}
          cursor={pathData.isClosed ? "pointer" : "default"}
          onPointerEnter={() => {
            if (pathData.isClosed) setHoveredIndex(index);
          }}
          onPointerLeave={() => {
            if (pathData.isClosed) setHoveredIndex(null);
          }}
          onPointerDown={() => {
            if (pathData.isClosed)
              setSelectedIndex(selectedIndex === index ? null : index);
          }}
          draw={(g) => {
            g.clear();

            // Parse the SVG path using svg-pathdata
            const pathParser = new SVGPathData(pathData.path);

            // Convert to absolute coordinates
            const absolutePath = pathParser.toAbs();

            // Set stroke style
            if (pathData.stroke) {
              const color = pathData.stroke === "white" ? 0xffffff : 0xffffff;
              g.setStrokeStyle({
                width: pathData.strokeWidth || 1,
                color: color,
              });
            }

            // Draw the path
            let currentX = 0;
            let currentY = 0;

            absolutePath.commands.forEach((command) => {
              switch (command.type) {
                case SVGPathData.MOVE_TO:
                  g.moveTo(command.x, command.y);
                  currentX = command.x;
                  currentY = command.y;
                  break;

                case SVGPathData.LINE_TO:
                  g.lineTo(command.x, command.y);
                  currentX = command.x;
                  currentY = command.y;
                  break;

                case SVGPathData.HORIZ_LINE_TO:
                  g.lineTo(command.x, currentY);
                  currentX = command.x;
                  break;

                case SVGPathData.VERT_LINE_TO:
                  g.lineTo(currentX, command.y);
                  currentY = command.y;
                  break;

                case SVGPathData.CURVE_TO:
                  g.bezierCurveTo(
                    command.x1,
                    command.y1,
                    command.x2,
                    command.y2,
                    command.x,
                    command.y
                  );
                  currentX = command.x;
                  currentY = command.y;
                  break;

                case SVGPathData.SMOOTH_CURVE_TO:
                  // For smooth curve, we need the previous control point
                  // This is a simplified version
                  g.quadraticCurveTo(
                    command.x2,
                    command.y2,
                    command.x,
                    command.y
                  );
                  currentX = command.x;
                  currentY = command.y;
                  break;

                case SVGPathData.QUAD_TO:
                  g.quadraticCurveTo(
                    command.x1,
                    command.y1,
                    command.x,
                    command.y
                  );
                  currentX = command.x;
                  currentY = command.y;
                  break;

                case SVGPathData.SMOOTH_QUAD_TO:
                  g.lineTo(command.x, command.y);
                  currentX = command.x;
                  currentY = command.y;
                  break;

                case SVGPathData.ARC:
                  // Arc is complex, we can approximate with lines or use a library
                  // For now, just draw a line to the end point
                  g.lineTo(command.x, command.y);
                  currentX = command.x;
                  currentY = command.y;
                  break;

                case SVGPathData.CLOSE_PATH:
                  g.closePath();
                  break;
              }
            });

            // Determine fill color and alpha
            let fillColor = 0x000000;
            let fillAlpha = 0;

            if (pathData.isClosed) {
              if (selectedIndex === index) {
                fillColor = 0x4caf50; // Green when selected
                fillAlpha = 0.6;
              } else if (hoveredIndex === index) {
                fillColor = 0x2196f3; // Blue when hovered
                fillAlpha = 0.4;
              } else {
                // Always fill closed paths with transparent color for hit detection
                fillColor = 0x000000;
                fillAlpha = 0.01; // Nearly transparent but enables hit detection
              }

              g.fill({ color: fillColor, alpha: fillAlpha });
            }

            // Stroke the path
            g.stroke();
          }}
        />
      ))}
    </>
  );
}
