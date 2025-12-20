import { useState, useEffect, useRef } from "react";
import { Graphics, Container } from "pixi.js";
import { extend, useTick } from "@pixi/react";
import { useControls } from "leva";

import borderSvgUrl from "./Betting-Grid-Border.svg";

import {
  fetchAndParseSVG,
  type SVGDimensions,
  type PathGroup,
} from "src/utils/graphics/svgParser";
import { drawSVGPath } from "src/utils/graphics/draws";

extend({ Graphics, Container });

export function GridBoardGfx() {
  const [pathGroups, setPathGroups] = useState<PathGroup>({
    closedPaths: [],
    openPaths: [],
  });
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
    fetchAndParseSVG(borderSvgUrl).then(({ pathGroups, dimensions }) => {
      // console.log("📊 Parsed SVG data:", {
      //   closedPaths: pathGroups.closedPaths.length,
      //   openPaths: pathGroups.openPaths.length,
      //   dimensions,
      // });
      // pathGroups.closedPaths.forEach((path, i) => {
      //   console.log(`Closed Path ${i}:`, {
      //     bounds: path.bounds,
      //     center: path.center,
      //     stroke: path.stroke,
      //   });
      // });
      setPathGroups(pathGroups);
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
      {/* Render open paths (non-interactive) */}
      {pathGroups.openPaths.map((pathData, index) => (
        <pixiGraphics
          key={`open-${index}`}
          x={-svgDimensions.width / 2}
          y={-svgDimensions.height / 2}
          eventMode="none"
          draw={(g) => {
            g.clear();

            // Set stroke style
            if (pathData.stroke) {
              const color = pathData.stroke === "white" ? 0xffffff : 0xffffff;
              g.setStrokeStyle({
                width: pathData.strokeWidth || 1,
                color: color,
              });
            }

            // Draw the path using utility
            drawSVGPath(g, pathData.path);

            // Stroke the path
            g.stroke();
          }}
        />
      ))}

      {/* Render closed paths (interactive) */}
      {pathGroups.closedPaths.map((pathData, index) => (
        <pixiGraphics
          key={`closed-${index}`}
          x={-svgDimensions.width / 2}
          y={-svgDimensions.height / 2}
          eventMode="static"
          cursor="pointer"
          onPointerEnter={() => setHoveredIndex(index)}
          onPointerLeave={() => setHoveredIndex(null)}
          onPointerDown={() =>
            setSelectedIndex(selectedIndex === index ? null : index)
          }
          draw={(g) => {
            g.clear();

            // Set stroke style
            if (pathData.stroke) {
              const color = pathData.stroke === "white" ? 0xffffff : 0xffffff;
              g.setStrokeStyle({
                width: pathData.strokeWidth || 1,
                color: color,
              });
            }

            // Draw the path using utility
            drawSVGPath(g, pathData.path);

            // Determine fill color and alpha
            let fillColor = 0x000000;
            let fillAlpha = 0;

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

            // Stroke the path
            g.stroke();
          }}
        />
      ))}
    </pixiContainer>
  );
}
