import { useState } from "react";
import { Application } from "@pixi/react";
import { useControls, button, Leva } from "leva";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { SceneProps } from "src/scenes/Scenes";
import { LighteningGraphics } from "src/scenes/lightning/LightningGraphics";

export default function Lightning({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();
  const [regenerateKey, setRegenerateKey] = useState(0);

  const controls = useControls("Lightning", {
    boltAmount: {
      value: 7,
      min: 1,
      max: 20,
      step: 1,
      label: "Bolt Amount",
    },
    displacement: {
      value: 150,
      min: 50,
      max: 300,
      step: 1,
      label: "Displacement",
    },
    jaggedness: {
      value: 0.5,
      min: 0,
      max: 2,
      step: 0.01,
      label: "Jaggedness",
    },
    segmentPoints: {
      value: 5,
      min: 1,
      max: 10,
      step: 1,
      label: "Segment Points",
    },
    segmentDensity: {
      value: 12,
      min: 4,
      max: 30,
      step: 1,
      label: "Segment Density",
    },
    envelopeShape: {
      value: 1,
      min: 0.5,
      max: 3,
      step: 0.1,
      label: "Envelope Shape",
    },
    smoothingIterations: {
      value: 2,
      min: 0,
      max: 10,
      step: 1,
      label: "Smoothing Iterations",
    },
    lineWidth: {
      value: 4,
      min: 1,
      max: 10,
      step: 1,
      label: "Line Width",
    },
    lineWidthVariation: {
      value: 3,
      min: 0,
      max: 10,
      step: 0.5,
      label: "Line Width Variation",
    },
    opacityVariation: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.1,
      label: "Opacity Variation",
    },
    boltColor1: {
      value: "#edffc1",
      label: "Bolt Color 1",
    },
    boltColor2: {
      value: "#c9fffa",
      label: "Bolt Color 2",
    },
    boltColor3: {
      value: "#c9ddff",
      label: "Bolt Color 3",
    },
    glowDistance: {
      value: 10,
      min: 0,
      max: 50,
      step: 1,
      label: "Glow Distance",
    },
    glowOuterStrength: {
      value: 2,
      min: 0,
      max: 10,
      step: 0.5,
      label: "Glow Outer Strength",
    },
    glowInnerStrength: {
      value: 1,
      min: 0,
      max: 10,
      step: 0.5,
      label: "Glow Inner Strength",
    },
    oscillationCycle: {
      value: 0.5,
      min: 0.1,
      max: 5,
      step: 0.5,
      label: "Oscillation Cycle (s)",
    },
    Regenerate: button(() => setRegenerateKey((prev) => prev + 1)),
  });

  return (
    <>
      <Application
        width={width}
        height={height}
        background={0x0a0e27}
        resizeTo={containerRef}
        antialias
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
          glowOuterStrength={controls.glowOuterStrength}
          glowInnerStrength={controls.glowInnerStrength}
          oscillationCycle={controls.oscillationCycle}
          regenerateKey={regenerateKey}
        />
      </Application>
      <Leva collapsed={true} theme={{ sizes: { rootWidth: "360px" } }} />
    </>
  );
}
