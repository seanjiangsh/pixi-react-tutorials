import { useState, useEffect } from "react";
import { Container } from "pixi.js";
import { extend } from "@pixi/react";
import { useControls } from "leva";
import { gridBoardControls, filterControls } from "./gridBoardControls";
import { ParsedSVG } from "src/utils/graphics/svgParser";
import { DATA_ROULETTE_GRID_BOARD } from "./data";
import { GridCell } from "./GridCell";

extend({ Container });

export function GridBoardGfx() {
  const [parsedSVG, setParsedSVG] = useState<ParsedSVG | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { tiltEnabled, tilt, pivot, strokeWidth } = useControls(
    "Perspective",
    gridBoardControls
  );

  const {
    blur,
    blurOpacity,
    glowDistance,
    glowOuterStrength,
    glowInnerStrength,
    glowQuality,
  } = useControls("Filters", filterControls);

  useEffect(() => {
    setParsedSVG(DATA_ROULETTE_GRID_BOARD);
  }, []);

  if (!parsedSVG) return null;

  const boardWidth = parsedSVG.dimensions.width;
  const boardHeight = parsedSVG.dimensions.height;

  return (
    <pixiContainer x={-boardWidth / 2} y={-boardHeight / 2}>
      {/* Render each cell with individual perspective transform */}
      {parsedSVG.paths.map((pathData, index) => (
        <GridCell
          key={`cell-${index}`}
          pathData={pathData}
          index={index}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          isHovered={hoveredIndex === index}
          isSelected={selectedIndex === index}
          tiltEnabled={tiltEnabled}
          tilt={tilt}
          pivot={pivot}
          strokeWidth={strokeWidth}
          blur={blur}
          blurOpacity={blurOpacity}
          glowDistance={glowDistance}
          glowOuterStrength={glowOuterStrength}
          glowInnerStrength={glowInnerStrength}
          glowQuality={glowQuality}
          onPointerEnter={() => setHoveredIndex(index)}
          onPointerLeave={() => setHoveredIndex(null)}
          onPointerDown={() =>
            setSelectedIndex(selectedIndex === index ? null : index)
          }
        />
      ))}
    </pixiContainer>
  );
}
