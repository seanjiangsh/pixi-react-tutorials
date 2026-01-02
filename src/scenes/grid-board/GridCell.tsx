import { useMemo, useCallback, memo } from "react";
import { Container, Text, TextStyle } from "pixi.js";
import { extend } from "@pixi/react";

import { SVGPathData } from "src/utils/graphics/svgParser";
import { transformSVGCommands } from "src/utils/graphics/svg";
import { GridCellGfx } from "./GridCellGfx";
import { GridCellShadowGfx } from "./GridCellShadowGfx";

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
  shadowType: "inner" | "outer";
  shadowGradientType: "linear" | "concentric";
  shadowLineCount: number;
  shadowExtendDistance: number;
  shadowColorStart: string;
  shadowColorEnd: string;
  shadowBlur: number;
  shadowOpacity: number;
  onPointerEnter: (index: number) => void;
  onPointerLeave: () => void;
  onPointerDown: (index: number) => void;
}

export function GridCell(props: GridCellProps) {
  const { pathData, index, boardWidth, boardHeight } = props;
  const { isHovered, isSelected } = props;
  const { tiltEnabled, tilt, pivot, strokeWidth } = props;
  const {
    shadowType,
    shadowGradientType,
    shadowLineCount,
    shadowExtendDistance,
    shadowColorStart,
    shadowColorEnd,
    shadowBlur,
    shadowOpacity,
  } = props;
  const { onPointerEnter, onPointerLeave, onPointerDown } = props;

  // Apply perspective transform to a point - memoized to avoid recalculation
  const transformPoint = useCallback(
    (x: number, y: number): { x: number; y: number } => {
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
    },
    [tiltEnabled, tilt, pivot, boardWidth, boardHeight]
  );

  // Use the precalculated center from pathData, or fallback to bounds center
  const cellCenter = useMemo(
    () =>
      pathData.center || {
        x: pathData.bounds ? pathData.bounds.x + pathData.bounds.width / 2 : 0,
        y: pathData.bounds ? pathData.bounds.y + pathData.bounds.height / 2 : 0,
      },
    [pathData]
  );

  // Calculate transformed center position
  const transformedCenter = useMemo(
    () => transformPoint(cellCenter.x, cellCenter.y),
    [transformPoint, cellCenter]
  );

  // Pre-transform the SVG path commands once - avoids recalculating in each child
  const transformedPathData = useMemo(() => {
    if (!pathData.commands) return pathData;
    return {
      ...pathData,
      commands: transformSVGCommands(pathData.commands, transformPoint),
      center: transformedCenter,
    };
  }, [pathData, transformPoint, transformedCenter]);

  // Calculate perspective transformation for text - memoized
  const textTransform = useMemo(() => {
    if (!tiltEnabled || tilt === 0) {
      return { skewX: 0, scaleY: 1 };
    }

    const boardCenterX = boardWidth / 2;
    const distanceFromCenter = (cellCenter.x - boardCenterX) / (boardWidth / 2);

    // Apply the same perspective transformations as the cells
    const skewX = distanceFromCenter * tilt * 0.5;
    const scaleY = 1 - Math.abs(tilt) * 0.3;

    return { skewX, scaleY };
  }, [tiltEnabled, tilt, boardWidth, cellCenter]);

  // Create text style - memoized
  const textStyle = useMemo(
    () =>
      new TextStyle({
        fontFamily: "Arial",
        fontSize: 24,
        fontWeight: "bold",
        fill: 0xffffff,
        align: "center",
        stroke: { color: 0x000000, width: 3 },
      }),
    []
  );

  // Wrap event handlers to pass index
  const handlePointerEnter = useCallback(() => {
    onPointerEnter(index);
  }, [onPointerEnter, index]);

  const handlePointerDown = useCallback(() => {
    onPointerDown(index);
  }, [onPointerDown, index]);

  return (
    <pixiContainer key={`cell-${index}`}>
      {/* Sharp layer with interaction */}
      <pixiContainer
        eventMode="static"
        cursor="pointer"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={handlePointerDown}
      >
        <GridCellGfx
          pathData={transformedPathData}
          strokeWidth={strokeWidth}
          isHovered={isHovered}
        />
      </pixiContainer>

      {/* Shadow for selected cells */}
      {isSelected && (
        <GridCellShadowGfx
          pathData={pathData}
          transformedPathData={transformedPathData}
          transformPoint={transformPoint}
          gradientType={shadowGradientType}
          lineCount={shadowLineCount}
          extendDistance={shadowExtendDistance}
          colorStart={shadowColorStart}
          colorEnd={shadowColorEnd}
          blur={shadowBlur}
          opacity={shadowOpacity}
          type={shadowType}
        />
      )}

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

// Memoize to prevent unnecessary rerenders
export default memo(GridCell);
