import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Container, Graphics } from "pixi.js";
import { extend } from "@pixi/react";
import { useControls } from "leva";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { transformSVGCommands, drawSVGPath } from "src/utils/graphics/svg";
import {
  createPerspectiveTransformer,
  PerspectiveConfig,
} from "src/utils/graphics/perspective";
import { SVGPathData } from "src/utils/graphics/svgParser";

import { gridBoardControls, shadowControls } from "./gridBoardControls";
import { DATA_ROULETTE_GRID_BOARD } from "./data";
import GridCell from "./GridCell";
import { GridCellBatchGfx } from "./GridCellBatchGfx";
import { PivotLineGfx } from "./PivotLineGfx";

extend({ Container, Graphics });

interface CellData {
  pathData: SVGPathData;
  transformedPathData: SVGPathData;
  index: number;
}

const { dimensions, paths } = DATA_ROULETTE_GRID_BOARD;

const { width: boardWidth, height: boardHeight } = dimensions;

export function GridBoardGfx() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { width, height } = useSceneSize();

  const {
    oscillate,
    tilt: controlTilt,
    pivot,
    strokeWidth,
    shiftX,
    shiftY,
    scaleX,
    scaleY,
    scaleAnchorX,
    scaleAnchorY,
  } = useControls("Perspective", gridBoardControls);

  // Use local state for oscillating tilt to avoid re-rendering controls
  const [oscillatingTilt, setOscillatingTilt] = useState(controlTilt);
  const tilt = oscillate ? oscillatingTilt : controlTilt;

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

  // Oscillation animation
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastTiltRef = useRef<number>(0);

  useEffect(() => {
    if (!oscillate) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    startTimeRef.current = Date.now();
    frameCountRef.current = 0;

    const animate = () => {
      frameCountRef.current++;

      // Only update every 2 frames to throttle renders (~30 updates/sec instead of 60)
      if (frameCountRef.current % 2 === 0) {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = (elapsed % 2000) / 2000; // 2 second cycle
        const tiltValue = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5; // Oscillate between 0 and 1

        // Only update if change is significant (> 0.01) to reduce unnecessary renders
        if (Math.abs(tiltValue - lastTiltRef.current) > 0.01) {
          lastTiltRef.current = tiltValue;
          setOscillatingTilt(tiltValue);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [oscillate]);

  // Calculate scale to fit board within scene width, maintaining aspect ratio
  const boardScale = useMemo(() => (width * 0.95) / boardWidth, [width]);

  const scaleValue = useMemo(
    () => ({ x: boardScale, y: boardScale }),
    [boardScale],
  );

  const xMargin = useMemo(
    () => (width - boardWidth * boardScale) / 2,
    [width, boardScale],
  );
  const yMargin = useMemo(
    () => (height - boardHeight * boardScale) / 2,
    [height, boardScale],
  );

  const pivotY = useMemo(() => boardHeight * pivot, [pivot]);

  const shift = useMemo(() => ({ x: shiftX, y: shiftY }), [shiftX, shiftY]);
  const boardTransformScale = useMemo(
    () => ({
      point: { x: scaleX, y: scaleY },
      anchor: {
        x: scaleAnchorX as "left" | "right",
        y: scaleAnchorY as "top" | "bottom",
      },
    }),
    [scaleX, scaleY, scaleAnchorX, scaleAnchorY],
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

  // Log renders (throttled)
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current++;
  });

  // Pre-transform all cells and group by state for batching
  const { normalCells, hoveredCell, selectedCell } = useMemo(() => {
    const perspectiveCfg: PerspectiveConfig = {
      tilt,
      pivot,
      reference: {
        width: boardWidth,
        height: boardHeight,
      },
    };

    const transformPoint = createPerspectiveTransformer(
      perspectiveCfg,
      shift,
      boardTransformScale,
    );

    const normal: CellData[] = [];
    let hovered: CellData | null = null;
    let selected: CellData | null = null;

    paths.forEach((pathData, index) => {
      // Calculate cell center
      const cellCenter = pathData.center || {
        x: pathData.bounds ? pathData.bounds.x + pathData.bounds.width / 2 : 0,
        y: pathData.bounds ? pathData.bounds.y + pathData.bounds.height / 2 : 0,
      };

      // Transform the center point
      const transformedCenter = transformPoint(cellCenter.x, cellCenter.y);

      const transformedPathData = {
        ...pathData,
        commands: pathData.commands
          ? transformSVGCommands(pathData.commands, transformPoint)
          : undefined,
        center: transformedCenter,
      };

      const cellData = {
        pathData,
        transformedPathData,
        index,
      };

      if (index === hoveredIndex) {
        hovered = cellData;
      } else if (index === selectedIndex) {
        selected = cellData;
      } else {
        normal.push(cellData);
      }
    });

    return {
      normalCells: normal,
      hoveredCell: hovered,
      selectedCell: selected,
    } as {
      normalCells: CellData[];
      hoveredCell: CellData | null;
      selectedCell: CellData | null;
    };
  }, [tilt, pivot, shift, boardTransformScale, hoveredIndex, selectedIndex]);

  return (
    <pixiContainer scale={scaleValue} x={xMargin} y={yMargin}>
      {/* Batch render normal cells */}
      {normalCells.length > 0 && (
        <GridCellBatchGfx
          cells={normalCells}
          strokeWidth={strokeWidth}
          fillColor={0x000000}
          fillAlpha={0.01}
          tilt={tilt}
          pivot={pivot}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
        />
      )}

      {/* Render hovered cell with full effects (shadow, text) */}
      {hoveredCell && (
        <GridCell
          key={`cell-${hoveredCell.index}`}
          pathData={hoveredCell.pathData}
          index={hoveredCell.index}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          isHovered={true}
          isSelected={false}
          tilt={tilt}
          pivot={pivot}
          strokeWidth={strokeWidth}
          shift={shift}
          scale={boardTransformScale}
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
      )}

      {/* Render selected cell with full effects (shadow, text) */}
      {selectedCell && (
        <GridCell
          key={`cell-${selectedCell.index}`}
          pathData={selectedCell.pathData}
          index={selectedCell.index}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          isHovered={false}
          isSelected={true}
          tilt={tilt}
          pivot={pivot}
          strokeWidth={strokeWidth}
          shift={shift}
          scale={boardTransformScale}
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
      )}

      {/* Hit detection layer - invisible graphics for mouse events */}
      {paths.map((pathData, index) => {
        // Skip hovered and selected cells - they handle their own events
        if (index === hoveredIndex || index === selectedIndex) return null;

        // Find the transformed path data for this cell
        const cellData = normalCells.find((c) => c.index === index);

        if (!cellData?.transformedPathData.commands) return null;

        return (
          <pixiGraphics
            key={`hit-${index}`}
            eventMode="static"
            cursor="pointer"
            draw={(g) => {
              g.clear();
              // Draw the transformed path as a hit area (invisible)
              drawSVGPath(g, cellData.transformedPathData.commands!);
              g.fill({ color: "transparent" }); // Invisible fill for hit detection
            }}
            onPointerEnter={() => handlePointerEnter(index)}
            onPointerLeave={handlePointerLeave}
            onPointerDown={() => handlePointerDown(index)}
          />
        );
      })}

      {/* Visualize the perspective pivot */}
      <PivotLineGfx boardWidth={boardWidth} pivotY={pivotY} />
    </pixiContainer>
  );
}
