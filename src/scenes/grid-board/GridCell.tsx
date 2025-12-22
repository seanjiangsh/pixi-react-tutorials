import { Container, Text, TextStyle } from "pixi.js";
import { extend } from "@pixi/react";

import { SVGPathData } from "src/utils/graphics/svgParser";
import { GridCellGfx } from "./GridCellGfx";

extend({ Container, Text });

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
  blur: number;
  blurOpacity: number;
  glowDistance: number;
  glowOuterStrength: number;
  glowInnerStrength: number;
  glowQuality: number;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPointerDown: () => void;
}

export function GridCell(props: GridCellProps) {
  const { pathData, index, boardWidth, boardHeight } = props;
  const { isHovered, isSelected } = props;
  const { tiltEnabled, tilt, pivot, strokeWidth, blur, blurOpacity } = props;
  const { glowDistance, glowOuterStrength, glowInnerStrength, glowQuality } =
    props;
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

  // Use the precalculated center from pathData, or fallback to bounds center
  const cellCenter = pathData.center || {
    x: pathData.bounds ? pathData.bounds.x + pathData.bounds.width / 2 : 0,
    y: pathData.bounds ? pathData.bounds.y + pathData.bounds.height / 2 : 0,
  };

  const transformedCenter = transformPoint(cellCenter.x, cellCenter.y);

  // Calculate perspective transformation for text
  const calculateTextTransform = () => {
    if (!tiltEnabled || tilt === 0) {
      return { skewX: 0, scaleY: 1 };
    }

    const boardCenterX = boardWidth / 2;
    const distanceFromCenter = (cellCenter.x - boardCenterX) / (boardWidth / 2);

    // Apply the same perspective transformations as the cells
    const skewX = distanceFromCenter * tilt * 0.5;
    const scaleY = 1 - Math.abs(tilt) * 0.3;

    return { skewX, scaleY };
  };

  const textTransform = calculateTextTransform();

  // Create text style
  const textStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
    fill: 0xffffff,
    align: "center",
    stroke: { color: 0x000000, width: 3 },
  });

  return (
    <pixiContainer key={`cell-${index}`}>
      {/* Sharp layer with interaction */}
      <pixiContainer
        eventMode="static"
        cursor="pointer"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        <GridCellGfx
          pathData={pathData}
          transformPoint={transformPoint}
          strokeWidth={strokeWidth}
          isHovered={isHovered}
          isSelected={isSelected}
          alpha={1}
        />
      </pixiContainer>

      {/* Blurred layer for anti-aliasing (non-interactive) */}
      <GridCellGfx
        pathData={pathData}
        transformPoint={transformPoint}
        strokeWidth={strokeWidth}
        isHovered={isHovered}
        isSelected={isSelected}
        blur={blur}
        alpha={blurOpacity}
        glowDistance={glowDistance}
        glowOuterStrength={glowOuterStrength}
        glowInnerStrength={glowInnerStrength}
        glowQuality={glowQuality}
      />

      <pixiText
        text={String(index)}
        x={transformedCenter.x}
        y={transformedCenter.y}
        anchor={{ x: 0.5, y: 0.5 }}
        style={textStyle}
        skew={{ x: textTransform.skewX, y: 0 }}
        scale={{ x: 1, y: textTransform.scaleY }}
      />
    </pixiContainer>
  );
}
