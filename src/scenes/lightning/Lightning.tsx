import { useState } from "react";
import { Application } from "@pixi/react";
import { useControls, Leva, button } from "leva";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { SceneProps } from "src/scenes/Scenes";
import { LighteningGraphics } from "src/scenes/lightning/LightningGraphics";
import { lightningControls } from "src/scenes/lightning/lightningControls";
import { GridOverlay } from "src/scenes/lightning/GridOverlay";

export default function Lightning({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [focusedCell, setFocusedCell] = useState({ col: 1, row: 1 });

  const controls = useControls("Lightning", {
    ...lightningControls,
    Regenerate: button(() => setRegenerateKey((prev) => prev + 1)),
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
          background={"#1c1c1cff"}
          resizeTo={containerRef}
        >
          <LighteningGraphics
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
        </Application>
      </div>
      <Leva collapsed={true} theme={{ sizes: { rootWidth: "360px" } }} />
    </>
  );
}
