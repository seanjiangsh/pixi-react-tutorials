import { useState, useEffect, useRef } from "react";
import { Graphics, Container, Matrix, Point } from "pixi.js";
import { extend } from "@pixi/react";
import { useControls } from "leva";
import { gridBoardControls } from "./gridBoardControls";
import { ParsedSVG } from "src/utils/graphics/svgParser";

import { DATA_ROULETTE_GRID_BOARD } from "./data";
import { drawSVGPath } from "src/utils/graphics/svg";

extend({ Graphics, Container });

export function GridBoardGfx() {
  const [parsedSVG, setParsedSVG] = useState<ParsedSVG | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<Container | null>(null);

  const {
    tiltEnabled,
    tilt,
    depth,
    sy,
    skewX,
    py,
    useDirectMatrix,
    strokeWidth,
  } = useControls("Perspective", gridBoardControls);

  useEffect(() => {
    setParsedSVG(DATA_ROULETTE_GRID_BOARD);
  }, []);

  // Apply matrix-based tilt per provided sample
  function applyTilt(
    obj: Container,
    tiltValue: number,
    depthValue: number,
    directSy: number,
    directSkewX: number,
    directPy: number,
    useDirect: boolean
  ) {
    const m = new Matrix();

    // Use either direct matrix parameters or calculated from tilt/depth
    const syValue = useDirect ? directSy : 1 - tiltValue * 0.4; // vertical squash
    const skewXValue = useDirect ? directSkewX : tiltValue * 0.6; // horizontal skew factor (shear)
    const pyValue = useDirect ? directPy : tiltValue * depthValue; // push backward (translate Y)

    // Build transform: scale -> skewX (shear) -> translate
    m.identity();
    m.scale(1, syValue);
    // Skew X can be represented by multiplying with a shear matrix [1, 0, k, 1, 0, 0]
    m.append(new Matrix(1, 0, skewXValue, 1, 0, 0));
    m.translate(0, pyValue);

    // Decompose into discrete properties and assign them to the container
    const t = {
      position: new Point(),
      scale: new Point(),
      pivot: new Point(),
      skew: new Point(),
      rotation: 0,
    };
    m.decompose(t);

    obj.position.copyFrom(t.position);
    obj.scale.copyFrom(t.scale);
    obj.skew.copyFrom(t.skew);
    obj.rotation = t.rotation;
    // Keep existing pivot; t.pivot will be (0,0) here.
  }

  // Update container transform whenever tilt settings change
  useEffect(() => {
    const obj = containerRef.current;
    console.log("Applying tilt:", obj, tiltEnabled, tilt, depth);
    if (!obj) return;

    if (tiltEnabled) {
      applyTilt(obj, tilt, depth, sy, skewX, py, useDirectMatrix);
    } else {
      // Reset transform to identity components
      obj.position.set(0, 0);
      obj.scale.set(1, 1);
      obj.skew.set(0, 0);
      obj.rotation = 0;
    }
  }, [tiltEnabled, tilt, depth, sy, skewX, py, useDirectMatrix]);

  return (
    <pixiContainer
      ref={containerRef}
      // pivot={{ x: parsedSVG.dimensions.width / 2, y: parsedSVG.dimensions.height / 2 }}
    >
      {/* Render all paths */}
      {parsedSVG?.paths.map((pathData, index) => (
        <pixiGraphics
          key={`path-${index}`}
          x={-parsedSVG.dimensions.width / 2}
          y={-parsedSVG.dimensions.height / 2}
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
            g.setStrokeStyle({
              width: strokeWidth,
              color: 0xffffff,
            });

            // Draw the path using utility with pre-parsed commands
            if (pathData.commands) {
              drawSVGPath(g, pathData.commands);
            }

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
