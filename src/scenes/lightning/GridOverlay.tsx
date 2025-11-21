import { useMemo } from "react";
import useSceneSize from "src/utils/hooks/useSceneSize";
import "./GridOverlay.css";

type GridOverlayProps = {
  focusedCell: { col: number; row: number };
  onCellClick: (col: number, row: number) => void;
};

export function GridOverlay({ focusedCell, onCellClick }: GridOverlayProps) {
  const { width, height } = useSceneSize();

  // Calculate grid dimensions to make perfectly square cells
  const { cols, rows, cellSize } = useMemo(() => {
    const isHorizontal = width > height;

    // Determine cell size based on orientation
    let cellSize: number;
    let rows: number;
    let cols: number;

    if (isHorizontal) {
      // Horizontal: occupy 60% of height
      const gridHeight = height * 0.6;
      const targetCellSize = 80;
      rows = Math.max(1, Math.floor(gridHeight / targetCellSize));
      cellSize = gridHeight / rows;
      // Ensure grid width doesn't exceed available width
      const maxCols = Math.floor(width / cellSize);
      cols = Math.max(1, maxCols);

      // If grid would exceed width, recalculate cellSize to fit
      if (cellSize * cols > width) {
        cellSize = width / cols;
        // Recalculate rows to maintain square cells
        rows = Math.max(1, Math.floor((height * 0.6) / cellSize));
      }
    } else {
      // Vertical: occupy 80% of height
      const gridHeight = height * 0.8;
      const targetCellSize = 80;
      rows = Math.max(1, Math.floor(gridHeight / targetCellSize));
      cellSize = gridHeight / rows;
      // Ensure grid width doesn't exceed available width
      const maxCols = Math.floor(width / cellSize);
      cols = Math.max(1, maxCols);

      // If grid would exceed width, recalculate cellSize to fit
      if (cellSize * cols > width) {
        cellSize = width / cols;
        // Recalculate rows to maintain square cells
        rows = Math.max(1, Math.floor((height * 0.8) / cellSize));
      }
    }

    return { cols, rows, cellSize };
  }, [width, height]);

  // Generate grid cells
  const cells = useMemo(() => {
    const result: Array<{ col: number; row: number }> = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        result.push({ col, row });
      }
    }
    return result;
  }, [cols, rows]);

  return (
    <div
      className="grid-overlay"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}
    >
      {cells.map(({ col, row }) => (
        <div
          key={`${col}-${row}`}
          className={`grid-cell ${
            col === focusedCell.col && row === focusedCell.row ? "focused" : ""
          }`}
          onClick={() => onCellClick(col, row)}
        />
      ))}
    </div>
  );
}
