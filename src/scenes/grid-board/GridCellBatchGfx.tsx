import { useCallback, memo } from "react";
import { Graphics, Container, Text, TextStyle } from "pixi.js";
import { extend } from "@pixi/react";

import { SVGPathData } from "src/utils/graphics/svgParser";
import { drawSVGPath } from "src/utils/graphics/svg";
import {
  calcTransform,
  PerspectiveConfig,
} from "src/utils/graphics/perspective";

extend({ Graphics, Container, Text });

// Shared text style to avoid creating new instances
const SHARED_TEXT_STYLE = new TextStyle({
  fontFamily: "Arial",
  fontSize: 24,
  fontWeight: "bold",
  fill: 0xffffff,
  align: "center",
  stroke: { color: 0x000000, width: 3 },
});

interface CellData {
  pathData: SVGPathData;
  transformedPathData: SVGPathData;
  index: number;
}

interface GridCellBatchGfxProps {
  cells: CellData[];
  strokeWidth: number;
  fillColor: number;
  fillAlpha: number;
  tilt: number;
  pivot: number;
  boardWidth: number;
  boardHeight: number;
}

function GridCellBatchGfxComponent(props: GridCellBatchGfxProps) {
  const {
    cells,
    strokeWidth,
    fillColor,
    fillAlpha,
    tilt,
    pivot,
    boardWidth,
    boardHeight,
  } = props;

  const perspectiveCfg: PerspectiveConfig = {
    tilt,
    pivot,
    reference: {
      width: boardWidth,
      height: boardHeight,
    },
  };

  const drawBatch = useCallback(
    (g: Graphics) => {
      g.clear();

      // Set stroke style once for all cells
      g.setStrokeStyle({
        width: strokeWidth,
        color: 0xffffff,
      });

      // Draw all cells in one graphics context
      cells.forEach((cell) => {
        if (cell.transformedPathData.commands) {
          drawSVGPath(g, cell.transformedPathData.commands);
        }
      });

      // Fill all paths at once
      g.fill({ color: fillColor, alpha: fillAlpha });

      // Stroke all paths at once
      g.stroke();
    },
    [cells, strokeWidth, fillColor, fillAlpha],
  );

  return (
    <pixiContainer>
      <pixiGraphics draw={drawBatch} />
      {/* Text layer for batched cells */}
      {cells.map((cellData) => {
        const center = cellData.pathData.center || {
          x: cellData.pathData.bounds
            ? cellData.pathData.bounds.x + cellData.pathData.bounds.width / 2
            : 0,
          y: cellData.pathData.bounds
            ? cellData.pathData.bounds.y + cellData.pathData.bounds.height / 2
            : 0,
        };

        const transformedCenter = cellData.transformedPathData.center || {
          x: center.x,
          y: center.y,
        };

        const textTransform = calcTransform(center.x, perspectiveCfg);

        return (
          <pixiText
            key={`text-${cellData.index}`}
            text={String(cellData.index)}
            x={transformedCenter.x}
            y={transformedCenter.y}
            anchor={{ x: 0.5, y: 0.5 }}
            style={SHARED_TEXT_STYLE}
            skew={{ x: textTransform.skewX, y: 0 }}
            scale={{ x: 1, y: textTransform.scaleY }}
          />
        );
      })}
    </pixiContainer>
  );
}

// Memoize to prevent redraws when props haven't changed
export const GridCellBatchGfx = memo(
  GridCellBatchGfxComponent,
  (prev, next) => {
    // If basic props changed, re-render
    if (
      prev.strokeWidth !== next.strokeWidth ||
      prev.fillColor !== next.fillColor ||
      prev.fillAlpha !== next.fillAlpha ||
      prev.cells.length !== next.cells.length ||
      prev.tilt !== next.tilt ||
      prev.pivot !== next.pivot ||
      prev.boardWidth !== next.boardWidth ||
      prev.boardHeight !== next.boardHeight
    ) {
      return false;
    }

    // Check if cells array reference changed (most common case when tilt changes)
    if (prev.cells !== next.cells) {
      return false;
    }

    // If cells array is the same reference, no need to re-render
    return true;
  },
);
