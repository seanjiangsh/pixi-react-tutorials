import { useControls } from "leva";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { LightningGfx } from "src/scenes/lightning/LightningGfx";
import {
  lightningControls,
  borderBoltControls,
  travelBoltControls,
} from "src/scenes/lightning/lightningControls";
import { BorderBoltGfx } from "src/scenes/lightning/BorderBoltGfx";
import { LightningTravelGfx } from "src/scenes/lightning/LightningTravelGfx";
import { useLightningStore } from "src/scenes/lightning/useLightningStore";

export function LightningPixi() {
  const { width, height } = useSceneSize();

  const {
    previousCell,
    focusedCell,
    touchPosition,
    isBorderAnimating,
    showBoltDemo,
    regenerateKey,
    handleBoltConnect,
  } = useLightningStore();

  const borderControls = useControls("Border Bolt", borderBoltControls, {
    collapsed: true,
    order: 1,
  });
  const travelControls = useControls("Travel Bolt", travelBoltControls, {
    collapsed: true,
    order: 2,
  });
  const demoControls = useControls("Bolt Demo", lightningControls, {
    collapsed: true,
    order: 3,
  });

  return (
    <>
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
      {Array.from({ length: travelControls.boltCount }).map((_, index) => (
        <LightningTravelGfx
          key={`travel-bolt-${index}`}
          fromCell={previousCell}
          toCell={focusedCell}
          displacement={travelControls.displacement}
          jaggedness={travelControls.jaggedness}
          branchProbability={travelControls.branchProbability}
          branchLength={travelControls.branchLength}
          travelDuration={travelControls.travelDuration}
          seed={index}
          onConnect={index === 0 ? handleBoltConnect : undefined}
        />
      ))}
      {showBoltDemo && (
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
    </>
  );
}
