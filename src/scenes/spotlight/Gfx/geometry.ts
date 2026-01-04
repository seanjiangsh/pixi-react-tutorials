import type { PointData } from "pixi.js";

export type BoardBounds = {
  topLeft: PointData;
  topRight: PointData;
  bottomRight: PointData;
  bottomLeft: PointData;
};

export type CellCorners = {
  topLeft: PointData;
  topRight: PointData;
  bottomRight: PointData;
  bottomLeft: PointData;
  center: PointData;
  width: number;
  height: number;
};

/**
 * Measure the transformed bounds of the roulette board
 */
export function getBoardBounds(): BoardBounds | null {
  const board = document.querySelector(".roulette-board");
  const canvas = document.querySelector("canvas");

  if (!board || !canvas) return null;

  const canvasRect = canvas.getBoundingClientRect();

  // Create temporary corner elements to detect transformed corners
  const createCornerPoint = (style: string) => {
    const point = document.createElement("div");
    point.style.cssText = `position: absolute; width: 1px; height: 1px; pointer-events: none; opacity: 0; ${style}`;
    return point;
  };

  const cornerTL = createCornerPoint("top: 0; left: 0;");
  const cornerTR = createCornerPoint("top: 0; right: 0;");
  const cornerBR = createCornerPoint("bottom: 0; right: 0;");
  const cornerBL = createCornerPoint("bottom: 0; left: 0;");

  board.appendChild(cornerTL);
  board.appendChild(cornerTR);
  board.appendChild(cornerBR);
  board.appendChild(cornerBL);

  // Force reflow
  board.getBoundingClientRect();

  const tlRect = cornerTL.getBoundingClientRect();
  const trRect = cornerTR.getBoundingClientRect();
  const brRect = cornerBR.getBoundingClientRect();
  const blRect = cornerBL.getBoundingClientRect();

  // Clean up
  board.removeChild(cornerTL);
  board.removeChild(cornerTR);
  board.removeChild(cornerBR);
  board.removeChild(cornerBL);

  return {
    topLeft: {
      x: tlRect.left - canvasRect.left,
      y: tlRect.top - canvasRect.top,
    },
    topRight: {
      x: trRect.left - canvasRect.left,
      y: trRect.top - canvasRect.top,
    },
    bottomRight: {
      x: brRect.left - canvasRect.left,
      y: brRect.top - canvasRect.top,
    },
    bottomLeft: {
      x: blRect.left - canvasRect.left,
      y: blRect.top - canvasRect.top,
    },
  };
}

/**
 * Measure the transformed corners of a specific cell
 */
export function getCellCorners(cellIndex: number): CellCorners | null {
  const board = document.querySelector(".roulette-board");
  const canvas = document.querySelector("canvas");

  if (!board || !canvas) return null;

  const cell = board.querySelector(
    `.roulette-cell[data-cell-index="${cellIndex}"]`
  ) as HTMLElement;

  if (!cell) return null;

  // Query corner test points for actual transformed positions
  const tlCorner = cell.querySelector('[data-corner="tl"]');
  const trCorner = cell.querySelector('[data-corner="tr"]');
  const brCorner = cell.querySelector('[data-corner="br"]');
  const blCorner = cell.querySelector('[data-corner="bl"]');

  if (!tlCorner || !trCorner || !brCorner || !blCorner) return null;

  const canvasRect = canvas.getBoundingClientRect();

  // Measure actual transformed corner positions
  const tlRect = tlCorner.getBoundingClientRect();
  const trRect = trCorner.getBoundingClientRect();
  const brRect = brCorner.getBoundingClientRect();
  const blRect = blCorner.getBoundingClientRect();

  const topLeft = {
    x: tlRect.left - canvasRect.left,
    y: tlRect.top - canvasRect.top,
  };
  const topRight = {
    x: trRect.right - canvasRect.left,
    y: trRect.top - canvasRect.top,
  };
  const bottomRight = {
    x: brRect.right - canvasRect.left,
    y: brRect.bottom - canvasRect.top,
  };
  const bottomLeft = {
    x: blRect.left - canvasRect.left,
    y: blRect.bottom - canvasRect.top,
  };

  const center = {
    x: (topLeft.x + topRight.x + bottomRight.x + bottomLeft.x) / 4,
    y: (topLeft.y + topRight.y + bottomRight.y + bottomLeft.y) / 4,
  };

  const width = Math.max(
    Math.abs(topRight.x - topLeft.x),
    Math.abs(bottomRight.x - bottomLeft.x)
  );
  const height = Math.max(
    Math.abs(bottomLeft.y - topLeft.y),
    Math.abs(bottomRight.y - topRight.y)
  );

  return {
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
    center,
    width,
    height,
  };
}

/**
 * Measure all cells in the roulette board
 */
export function getAllCellCorners(
  cellCount: number = 37
): Map<number, CellCorners> {
  const cellMap = new Map<number, CellCorners>();
  for (let i = 0; i < cellCount; i++) {
    const corners = getCellCorners(i);
    if (corners) {
      cellMap.set(i, corners);
    }
  }
  return cellMap;
}
