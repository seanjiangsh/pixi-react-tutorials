import { useMemo } from "react";
import useSceneSize from "src/utils/hooks/useSceneSize";
import "./RouletteBoard.css";

// European Roulette table layout (as shown in image - 3 rows, reading left to right)
// Row 1: 0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
// Row 2: (blank at start for 0), 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
// Row 3: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
// Need to pad with null to maintain grid structure
const ROULETTE_LAYOUT = [
  // Row 1 (top)
  3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36,
  // Row 2 (middle)
  2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35,
  // Row 3 (bottom)
  1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34,
];

// Red numbers in roulette
const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

type RouletteBoardProps = {
  focusedCells: number[];
  onCellClick: (cellIndex: number) => void;
};

export function RouletteBoard({
  focusedCells,
  onCellClick,
}: RouletteBoardProps) {
  const { width, height } = useSceneSize();

  // Calculate grid dimensions - 3 rows + separate 0 cell
  const { cols, rows, cellSize, isHorizontal } = useMemo(() => {
    const isHorizontal = width > height;

    // Swap rows/cols for portrait to make board vertical
    const rows = isHorizontal ? 3 : 13; // Portrait: 13 rows (1 for "0" + 12 for numbers)
    const cols = isHorizontal ? 13 : 3; // Portrait: 3 cols

    let cellSize: number;

    if (isHorizontal) {
      // Horizontal: use 70% of width
      const gridWidth = width * 0.7;
      cellSize = gridWidth / cols;

      // Ensure grid height doesn't exceed available height
      const maxHeight = height * 0.8;
      if (cellSize * rows > maxHeight) {
        cellSize = maxHeight / rows;
      }
    } else {
      // Portrait: use 80% of height
      const gridHeight = height * 0.8;
      cellSize = gridHeight / rows;

      // Ensure grid width doesn't exceed available width
      const maxWidth = width * 0.9;
      if (cellSize * cols > maxWidth) {
        cellSize = maxWidth / cols;
      }
    }

    return { cols, rows, cellSize, isHorizontal };
  }, [width, height]);

  // Get color for a roulette number
  const getNumberColor = (number: number): string => {
    if (number === 0) return "green";
    return RED_NUMBERS.has(number) ? "red" : "black";
  };

  return (
    <>
      <div
        className="roulette-board slope"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {/* 0 cell spanning all 3 rows/cols on the left/top */}
        <div
          className={`roulette-cell green zero-cell ${
            focusedCells.includes(0) ? "focused" : ""
          }`}
          onClick={() => onCellClick(0)}
          data-cell-index={0}
          style={{
            gridRow: isHorizontal ? "1 / 4" : "1 / 2",
            gridColumn: isHorizontal ? "1 / 2" : "1 / 4",
          }}
        >
          <span className="roulette-number">0</span>
          {/* Corner test points for accurate position measurement */}
          <div
            className="cell-corner"
            data-corner="tl"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1px",
              height: "1px",
              pointerEvents: "none",
            }}
          />
          <div
            className="cell-corner"
            data-corner="tr"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "1px",
              height: "1px",
              pointerEvents: "none",
            }}
          />
          <div
            className="cell-corner"
            data-corner="br"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "1px",
              height: "1px",
              pointerEvents: "none",
            }}
          />
          <div
            className="cell-corner"
            data-corner="bl"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "1px",
              height: "1px",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Regular number cells */}
        {ROULETTE_LAYOUT.map((number, index) => {
          // Cell indices: 0 is separate, regular cells are 1-36 (matching their number)
          const actualIndex = number;

          let row: number, col: number;
          if (isHorizontal) {
            // Landscape: 3 rows × 12 cols
            row = Math.floor(index / 12) + 1;
            col = (index % 12) + 2; // Start from column 2
          } else {
            // Portrait: 12 rows × 3 cols (rotated layout)
            row = (index % 12) + 2; // Start from row 2
            col = Math.floor(index / 12) + 1;
          }

          return (
            <div
              key={actualIndex}
              className={`roulette-cell ${getNumberColor(number)} ${
                focusedCells.includes(actualIndex) ? "focused" : ""
              }`}
              onClick={() => onCellClick(actualIndex)}
              data-cell-index={actualIndex}
              style={{
                gridRow: row,
                gridColumn: col,
              }}
            >
              <span className="roulette-number">{number}</span>
              {/* Corner test points for accurate position measurement */}
              <div
                className="cell-corner"
                data-corner="tl"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "1px",
                  height: "1px",
                  pointerEvents: "none",
                }}
              />
              <div
                className="cell-corner"
                data-corner="tr"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "1px",
                  height: "1px",
                  pointerEvents: "none",
                }}
              />
              <div
                className="cell-corner"
                data-corner="br"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "1px",
                  height: "1px",
                  pointerEvents: "none",
                }}
              />
              <div
                className="cell-corner"
                data-corner="bl"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "1px",
                  height: "1px",
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </div>
      {/* Hidden test points for geometry detection */}
      <div className="test-point" id="test-point-tl" />
      <div className="test-point" id="test-point-tr" />
      <div className="test-point" id="test-point-br" />
      <div className="test-point" id="test-point-bl" />
    </>
  );
}
