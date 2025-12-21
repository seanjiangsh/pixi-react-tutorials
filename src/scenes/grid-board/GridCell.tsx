import { Graphics, Container } from "pixi.js";
import { extend } from "@pixi/react";

import { SVGPathData } from "src/utils/graphics/svgParser";
import { drawSVGPath } from "src/utils/graphics/svg";

extend({ Graphics, Container });

interface GridCellProps {
  pathData: SVGPathData;
  index: number;
  boardWidth: number;
  boardHeight: number;
  isHovered: boolean;
  isSelected: boolean;
  tiltEnabled: boolean;
  tilt: number;
  pivot: number;
  strokeWidth: number;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPointerDown: () => void;
}

export function GridCell(props: GridCellProps) {
  const { pathData, index, boardWidth, boardHeight } = props;
  const { isHovered, isSelected } = props;
  const { tiltEnabled, tilt, pivot, strokeWidth } = props;
  const { onPointerEnter, onPointerLeave, onPointerDown } = props;

  // Apply perspective transform to a point
  const transformPoint = (x: number, y: number): { x: number; y: number } => {
    if (!tiltEnabled || tilt === 0) {
      return { x, y };
    }

    const boardCenterX = boardWidth / 2;
    const distanceFromCenter = (x - boardCenterX) / (boardWidth / 2);

    // Calculate pivot point (0=top, 1=bottom)
    const pivotY = boardHeight * pivot;
    const yFromPivot = y - pivotY;

    // Apply perspective transformations
    // Negative sign on skewAmount creates the "/ | \" effect:
    // - Left cells (distanceFromCenter < 0): positive skew → tilt right
    // - Right cells (distanceFromCenter > 0): negative skew → tilt left
    const skewAmount = -distanceFromCenter * tilt * 0.5;
    const scaleY = 1 - Math.abs(tilt) * 0.3;

    // Apply transformations to the point relative to pivot
    // The minus sign ensures cells tilt toward center at the top
    const newX = x - yFromPivot * skewAmount;
    // Scale vertically relative to pivot
    const newY = pivotY + yFromPivot * scaleY;

    return { x: newX, y: newY };
  };

  return (
    <pixiContainer key={`cell-${index}`}>
      <pixiGraphics
        eventMode="static"
        cursor="pointer"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        draw={(g) => {
          g.clear();

          // Set stroke style
          g.setStrokeStyle({
            width: strokeWidth,
            color: 0xffffff,
          });

          // Draw the path with perspective-transformed coordinates
          if (pathData.commands) {
            drawSVGPath(g, pathData.commands, transformPoint);
          }

          // Determine fill color and alpha
          let fillColor = 0x000000;
          let fillAlpha = 0;

          if (isSelected) {
            fillColor = 0x4caf50; // Green when selected
            fillAlpha = 0.6;
          } else if (isHovered) {
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
    </pixiContainer>
  );
}
