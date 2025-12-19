import { useState, useEffect, useRef } from "react";
import { Graphics, Container } from "pixi.js";
import { extend, useTick } from "@pixi/react";
import { SVGPathData } from "svg-pathdata";
import { useControls } from "leva";

// import originalBorderSvgUrl from "./Betting-Grid-Border.svg?url";
import borderSvgUrl from "./Betting-Grid-Border.svg";

import {
  fetchAndParseSVG,
  type SVGPathData as SVGPath,
  type SVGDimensions,
} from "src/utils/graphics/svgParser";

extend({ Graphics, Container });

export function GridBoardGfx_svgPathdata() {
  const [svgPaths, setSvgPaths] = useState<SVGPath[]>([]);
  const [svgDimensions, setSvgDimensions] = useState<SVGDimensions>({
    width: 0,
    height: 0,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Animation state (use state instead of refs for rendering)
  const [currentScaleY, setCurrentScaleY] = useState(1);
  const [currentSkewY, setCurrentSkewY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const targetScaleYRef = useRef(1);
  const targetSkewYRef = useRef(0);
  const targetYRef = useRef(0);

  const { tiltEnabled, tiltAngle, tiltScale } = useControls("Perspective", {
    tiltEnabled: { value: false, label: "Enable Tilt" },
    tiltAngle: { value: 4.7, min: 0, max: 45, step: 0.1, label: "Tilt Angle" },
    tiltScale: { value: 0.745, min: 0.5, max: 1, step: 0.01, label: "Y Scale" },
  });

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

  // Update target values when tilt settings change
  useEffect(() => {
    if (tiltEnabled) {
      const radians = (tiltAngle * Math.PI) / 180;
      targetScaleYRef.current = tiltScale;
      targetSkewYRef.current = radians * 0.02;
      targetYRef.current = -svgDimensions.height * 0.084;
    } else {
      targetScaleYRef.current = 1;
      targetSkewYRef.current = 0;
      targetYRef.current = 0;
    }
  }, [tiltEnabled, tiltAngle, tiltScale, svgDimensions.height]);

  // Animate transform values (1 second = 60 frames at 60fps, so 1/60 per frame)
  useTick((delta) => {
    const animationSpeed = delta.deltaMS / 60; // 1 second animation at 60fps

    setCurrentScaleY(
      (prev) => prev + (targetScaleYRef.current - prev) * animationSpeed
    );
    setCurrentSkewY(
      (prev) => prev + (targetSkewYRef.current - prev) * animationSpeed
    );
    setCurrentY((prev) => prev + (targetYRef.current - prev) * animationSpeed);
  });

  return (
    <pixiContainer
      y={currentY}
      scale={{ x: 1, y: currentScaleY }}
      skew={{ x: 0, y: currentSkewY }}
    >
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
    </pixiContainer>
  );
}
