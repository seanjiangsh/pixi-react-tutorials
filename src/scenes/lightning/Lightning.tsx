import { useEffect, useState } from "react";
import { Application } from "@pixi/react";
import { useControls, Leva, button } from "leva";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { SceneProps } from "src/scenes/Scenes";
import { LightningGfx } from "src/scenes/lightning/LightningGfx";
import {
  lightningControls,
  borderBoltControls,
  travelBoltControls,
} from "src/scenes/lightning/lightningControls";
import { GridOverlay } from "src/scenes/lightning/GridOverlay";
import { BorderBoltGfx } from "src/scenes/lightning/BorderBoltGfx";
import { LightningTravelGfx } from "src/scenes/lightning/LightningTravelGfx";

export default function Lightning({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [focusedCell, setFocusedCell] = useState({ col: 0, row: 0 });
  const [previousCell, setPreviousCell] = useState({ col: 0, row: 0 });
  const [showDemo, setShowDemo] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isBorderAnimating, setIsBorderAnimating] = useState(true); // Start animating on initial load

  // Track cell changes for travel bolt
  const handleCellClick = (col: number, row: number) => {
    const isSameCell = focusedCell.col === col && focusedCell.row === row;
    const isResetToOrigin = col === 0 && row === 0;
    setPreviousCell(focusedCell);
    setFocusedCell({ col, row });
    // If same cell (reset) or reset to origin (from grid resize), start animating immediately. Otherwise wait for travel bolt
    setIsBorderAnimating(isSameCell || isResetToOrigin);
    setTouchPosition(null);
  };

  // Handle when travel bolt connects
  const handleBoltConnect = (point: { x: number; y: number }) => {
    // Point is where the travel bolt ends - we need to find where it touches the border
    // The touch position calculation will be done in BorderBoltGfx
    setTouchPosition(point);
    setIsBorderAnimating(true);
  };

  const borderControls = useControls("Border Bolt", borderBoltControls, {
    collapsed: true,
  });
  const travelControls = useControls("Travel Bolt", travelBoltControls, {
    collapsed: true,
  });
  const demoControls = useControls(
    "Bolt Demo",
    {
      ...lightningControls,
      "Toggle bolts Demo": button(() => setShowDemo((prev) => !prev)),
      Regenerate: button(() => setRegenerateKey((prev) => prev + 1)),
    },
    { collapsed: true }
  );

  return (
    <>
      <div style={{ position: "relative", width, height }}>
        <GridOverlay focusedCell={focusedCell} onCellClick={handleCellClick} />
        <Application
          width={width}
          height={height}
          backgroundAlpha={0}
          resizeTo={containerRef}
        >
          {isBorderAnimating && (
            <BorderBoltGfx
              enableLightning={borderControls.enableLightning}
              jaggedAmplitude={borderControls.jaggedAmplitude}
              jaggedFrequency1={borderControls.jaggedFrequency1}
              jaggedFrequency2={borderControls.jaggedFrequency2}
              jaggedFrequency3={borderControls.jaggedFrequency3}
              timeScale={borderControls.timeScale}
              randomness={borderControls.randomness}
              inset={borderControls.inset}
              borderRadius={borderControls.borderRadius}
              lineWidth={borderControls.lineWidth}
              branchProbability={borderControls.branchProbability}
              branchLength={borderControls.branchLength}
              startDelay={borderControls.startDelay}
              roundDuration={borderControls.roundDuration}
              growthDuration={borderControls.growthDuration}
              startPosition={touchPosition}
            />
          )}
          {travelControls.enableTravelBolt &&
            Array.from({ length: travelControls.boltCount }).map((_, index) => (
              <LightningTravelGfx
                key={`travel-bolt-${index}`}
                fromCell={previousCell}
                toCell={focusedCell}
                displacement={travelControls.displacement}
                jaggedness={travelControls.jaggedness}
                branchProbability={travelControls.branchProbability}
                branchLength={travelControls.branchLength}
                travelDuration={travelControls.travelDuration}
                seed={index} // Different seed for each bolt
                onConnect={index === 0 ? handleBoltConnect : undefined} // Only first bolt triggers border animation
              />
            ))}
          {showDemo && (
            <LightningGfx
              width={width}
              height={height}
              boltAmount={demoControls.boltAmount}
              displacement={demoControls.displacement}
              jaggedness={demoControls.jaggedness}
              segmentPoints={demoControls.segmentPoints}
              segmentDensity={demoControls.segmentDensity}
              envelopeShape={demoControls.envelopeShape}
              smoothingIterations={demoControls.smoothingIterations}
              lineWidth={demoControls.lineWidth}
              lineWidthVariation={demoControls.lineWidthVariation}
              opacityVariation={demoControls.opacityVariation}
              boltColors={[
                demoControls.boltColor1,
                demoControls.boltColor2,
                demoControls.boltColor3,
              ]}
              glowDistance={demoControls.glowDistance}
              oscillationCycle={demoControls.oscillationCycle}
              regenerateKey={regenerateKey}
            />
          )}
        </Application>
      </div>
      <Leva collapsed={true} theme={{ sizes: { rootWidth: "360px" } }} />
    </>
  );
}
