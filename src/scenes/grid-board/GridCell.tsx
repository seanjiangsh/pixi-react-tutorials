import { useMemo, useCallback, memo } from "react";
import { Container, Text, TextStyle, PointData } from "pixi.js";
import { extend } from "@pixi/react";

import { SVGPathData } from "src/utils/graphics/svgParser";
import { transformSVGCommands } from "src/utils/graphics/svg";
import {
  createPerspectiveTransformer,
  calcTransform,
  PerspectiveConfig,
  ScaleConfig,
} from "src/utils/graphics/perspective";
import { GridCellGfx } from "./GridCellGfx";
import { GridCellShadowGfx } from "./GridCellShadowGfx";

extend({ Container, Text });

// Shared text style to avoid creating new instances for each cell
const SHARED_TEXT_STYLE = new TextStyle({
  fontFamily: "Arial",
  fontSize: 24,
  fontWeight: "bold",
  fill: 0xffffff,
  align: "center",
  stroke: { color: 0x000000, width: 3 },
});

interface GridCellProps {
  pathData: SVGPathData;
  index: number;
  boardWidth: number;
  boardHeight: number;
  isHovered: boolean;
  isSelected: boolean;
  tilt: number;
  pivot: number;
  strokeWidth: number;
  shift: PointData;
  scale?: ScaleConfig;
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
  const { tilt, pivot, strokeWidth, shift, scale } = props;
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

  // Create perspective transformer - memoized to avoid recalculation
  const perspectiveCfg: PerspectiveConfig = useMemo(
    () => ({
      tilt,
      pivot,
      reference: {
        width: boardWidth,
        height: boardHeight,
      },
    }),
    [tilt, pivot, boardWidth, boardHeight],
  );

  const transformPoint = useMemo(
    () => createPerspectiveTransformer(perspectiveCfg, shift, scale),
    [perspectiveCfg, shift, scale],
  );

  // Use the precalculated center from pathData, or fallback to bounds center
  const cellCenter = useMemo(
    () =>
      pathData.center || {
        x: pathData.bounds ? pathData.bounds.x + pathData.bounds.width / 2 : 0,
        y: pathData.bounds ? pathData.bounds.y + pathData.bounds.height / 2 : 0,
      },
    [pathData],
  );

  // Calculate transformed center position
  const transformedCenter = useMemo(
    () => transformPoint(cellCenter.x, cellCenter.y),
    [transformPoint, cellCenter],
  );

  // Pre-transform the SVG path commands once - avoids recalculating in each child
  const transformedPathData = useMemo(() => {
    if (!pathData.commands) return pathData;
    const result = {
      ...pathData,
      commands: transformSVGCommands(pathData.commands, transformPoint),
      center: transformedCenter,
    };
    return result;
  }, [pathData, transformPoint, transformedCenter]);

  // Calculate perspective transformation for text - memoized
  const textTransform = useMemo(
    () => calcTransform(cellCenter.x, perspectiveCfg),
    [perspectiveCfg, cellCenter],
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
        style={SHARED_TEXT_STYLE}
        skew={{ x: textTransform.skewX, y: 0 }}
        scale={{ x: 1, y: textTransform.scaleY }}
      />
    </pixiContainer>
  );
}

// Memoize with custom comparison to prevent unnecessary rerenders
function arePropsEqual(prev: GridCellProps, next: GridCellProps) {
  // Only re-render if these specific props change
  // Use tolerance for tilt to avoid micro-changes causing renders
  const tiltChanged = Math.abs(prev.tilt - next.tilt) > 0.001;
  const isEqual =
    prev.index === next.index &&
    prev.isHovered === next.isHovered &&
    prev.isSelected === next.isSelected &&
    !tiltChanged &&
    prev.pivot === next.pivot &&
    prev.strokeWidth === next.strokeWidth &&
    prev.shift.x === next.shift.x &&
    prev.shift.y === next.shift.y &&
    prev.scale?.point.x === next.scale?.point.x &&
    prev.scale?.point.y === next.scale?.point.y &&
    prev.scale?.anchor.x === next.scale?.anchor.x &&
    prev.scale?.anchor.y === next.scale?.anchor.y &&
    prev.shadowType === next.shadowType &&
    prev.shadowGradientType === next.shadowGradientType &&
    prev.shadowLineCount === next.shadowLineCount &&
    prev.shadowExtendDistance === next.shadowExtendDistance &&
    prev.shadowColorStart === next.shadowColorStart &&
    prev.shadowColorEnd === next.shadowColorEnd &&
    prev.shadowBlur === next.shadowBlur &&
    prev.shadowOpacity === next.shadowOpacity &&
    prev.boardWidth === next.boardWidth &&
    prev.boardHeight === next.boardHeight;
  // Skip pathData comparison as it's stable
  // Skip function props as they're memoized in parent

  if (!isEqual && prev.index === next.index) {
    const changedProps: string[] = [];
    if (tiltChanged)
      changedProps.push(
        `tilt (${prev.tilt.toFixed(3)} → ${next.tilt.toFixed(3)})`,
      );
    if (prev.isHovered !== next.isHovered) changedProps.push("isHovered");
    if (prev.isSelected !== next.isSelected) changedProps.push("isSelected");
  }

  return isEqual;
}

export default memo(GridCell, arePropsEqual);
