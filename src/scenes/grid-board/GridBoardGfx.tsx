import { useState, useMemo, useCallback } from "react";
import { Container, Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import { useControls } from "leva";
import { gridBoardControls, shadowControls } from "./gridBoardControls";
import {
  DATA_ROULETTE_GRID_BOARD,
  DATA_SICBO_MOBILE_BOARD,
  DATA_SICBO_MOBILE_BOARD_BACKGROUND,
} from "./data";
import GridCell from "./GridCell";
import { PivotLineGfx } from "./PivotLineGfx";
import useSceneSize from "src/utils/hooks/useSceneSize";

extend({ Container, Graphics });

// const { dimensions, paths } = DATA_ROULETTE_GRID_BOARD;
// const { dimensions, paths } = DATA_SICBO_MOBILE_BOARD;
const { dimensions, paths } = DATA_SICBO_MOBILE_BOARD_BACKGROUND;

const { width: boardWidth, height: boardHeight } = dimensions;

export function GridBoardGfx() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { width, height } = useSceneSize();

  const {
    tilt,
    pivot,
    strokeWidth,
    shiftX,
    shiftY,
    scaleX,
    scaleY,
    scaleAnchorX,
    scaleAnchorY,
  } = useControls("Perspective", gridBoardControls);

  const {
    shadowType,
    shadowGradientType,
    shadowLineCount,
    shadowExtendDistance,
    shadowColorStart,
    shadowColorEnd,
    shadowBlur,
    shadowOpacity,
  } = useControls("Shadow", shadowControls, { collapsed: true });

  // Calculate scale to fit board within scene width, maintaining aspect ratio
  const boardScale = useMemo(() => (width * 0.95) / boardWidth, [width]);

  const scaleValue = useMemo(
    () => ({ x: boardScale, y: boardScale }),
    [boardScale]
  );

  const xMargin = useMemo(
    () => (width - boardWidth * boardScale) / 2,
    [width, boardScale]
  );
  const yMargin = useMemo(
    () => (height - boardHeight * boardScale) / 2,
    [height, boardScale]
  );

  const pivotY = useMemo(() => boardHeight * pivot, [pivot]);

  const shift = useMemo(() => ({ x: shiftX, y: shiftY }), [shiftX, shiftY]);
  const boardTransformScale = useMemo(
    () => ({ x: scaleX, y: scaleY }),
    [scaleX, scaleY]
  );
  const scaleAnchor = useMemo(
    () => ({
      x: scaleAnchorX as "left" | "right",
      y: scaleAnchorY as "top" | "bottom",
    }),
    [scaleAnchorX, scaleAnchorY]
  );

  // Create stable event handler references
  const handlePointerEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handlePointerDown = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <pixiContainer scale={scaleValue} x={xMargin} y={yMargin}>
      {/* Render each cell with individual perspective transform */}
      {paths.map((pathData, index) => (
        <GridCell
          key={`cell-${index}`}
          pathData={pathData}
          index={index}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          isHovered={hoveredIndex === index}
          isSelected={selectedIndex === index}
          tilt={tilt}
          pivot={pivot}
          strokeWidth={strokeWidth}
          shift={shift}
          scale={boardTransformScale}
          scaleAnchor={scaleAnchor}
          shadowType={shadowType as "inner" | "outer"}
          shadowGradientType={shadowGradientType as "linear" | "concentric"}
          shadowLineCount={shadowLineCount}
          shadowExtendDistance={shadowExtendDistance}
          shadowColorStart={shadowColorStart}
          shadowColorEnd={shadowColorEnd}
          shadowBlur={shadowBlur}
          shadowOpacity={shadowOpacity}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
        />
      ))}

      {/* Visualize the perspective pivot */}
      <PivotLineGfx boardWidth={boardWidth} pivotY={pivotY} />
    </pixiContainer>
  );
}
