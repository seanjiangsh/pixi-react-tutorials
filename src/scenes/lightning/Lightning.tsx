import { useState } from "react";
import { Application } from "@pixi/react";
import { useControls, Leva, button, folder } from "leva";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { SceneProps } from "src/scenes/Scenes";
import { LightningGfx } from "src/scenes/lightning/LightningGfx";
import {
  lightningControls,
  borderBoltControls,
} from "src/scenes/lightning/lightningControls";
import { GridOverlay } from "src/scenes/lightning/GridOverlay";
import { BorderBoltGfx } from "src/scenes/lightning/BorderBoltGfx";

export default function Lightning({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [focusedCell, setFocusedCell] = useState({ col: 0, row: 0 });
  const [showDemo, setShowDemo] = useState(false);

  const controls = useControls({
    "Border Bolt Controls": folder(borderBoltControls, { collapsed: true }),
    "Bolt Demo Controls": folder(
      {
        ...lightningControls,
        "Toggle bolts Demo": button(() => setShowDemo((prev) => !prev)),
        Regenerate: button(() => setRegenerateKey((prev) => prev + 1)),
      },
      { collapsed: true }
    ),
  });

  return (
    <>
      <div style={{ position: "relative", width, height }}>
        <GridOverlay
          focusedCell={focusedCell}
          onCellClick={(col, row) => setFocusedCell({ col, row })}
        />
        <Application
          width={width}
          height={height}
          backgroundAlpha={0}
          resizeTo={containerRef}
        >
          <BorderBoltGfx
            enableLightning={controls.enableLightning}
            jaggedAmplitude={controls.jaggedAmplitude}
            jaggedFrequency1={controls.jaggedFrequency1}
            jaggedFrequency2={controls.jaggedFrequency2}
            jaggedFrequency3={controls.jaggedFrequency3}
            timeScale={controls.timeScale}
            randomness={controls.randomness}
            inset={controls.inset}
            borderRadius={controls.borderRadius}
          />
          {showDemo && (
            <LightningGfx
              width={width}
              height={height}
              boltAmount={controls.boltAmount}
              displacement={controls.displacement}
              jaggedness={controls.jaggedness}
              segmentPoints={controls.segmentPoints}
              segmentDensity={controls.segmentDensity}
              envelopeShape={controls.envelopeShape}
              smoothingIterations={controls.smoothingIterations}
              lineWidth={controls.lineWidth}
              lineWidthVariation={controls.lineWidthVariation}
              opacityVariation={controls.opacityVariation}
              boltColors={[
                controls.boltColor1,
                controls.boltColor2,
                controls.boltColor3,
              ]}
              glowDistance={controls.glowDistance}
              oscillationCycle={controls.oscillationCycle}
              regenerateKey={regenerateKey}
            />
          )}
        </Application>
      </div>
      <Leva collapsed={true} theme={{ sizes: { rootWidth: "360px" } }} />
    </>
  );
}
