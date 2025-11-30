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

const isStorybook = import.meta.env.VITE_IN_STORYBOOK === "true";

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
    borderBoltControls: storeBorderControls,
    travelBoltControls: storeTravelControls,
    boltDemoControls: storeBoltDemoControls,
    setBorderBoltControls,
    setTravelBoltControls,
    setBoltDemoControls,
  } = useLightningStore();

  // Leva controls - update store when they change
  useControls(
    "Border Bolt",
    {
      enableLightning: {
        ...borderBoltControls.enableLightning,
        value: storeBorderControls.enableLightning,
        onChange: (v) => setBorderBoltControls({ enableLightning: v }),
      },
      jaggedAmplitude: {
        ...borderBoltControls.jaggedAmplitude,
        value: storeBorderControls.jaggedAmplitude,
        onChange: (v) => setBorderBoltControls({ jaggedAmplitude: v }),
      },
      jaggedFrequency1: {
        ...borderBoltControls.jaggedFrequency1,
        value: storeBorderControls.jaggedFrequency1,
        onChange: (v) => setBorderBoltControls({ jaggedFrequency1: v }),
      },
      jaggedFrequency2: {
        ...borderBoltControls.jaggedFrequency2,
        value: storeBorderControls.jaggedFrequency2,
        onChange: (v) => setBorderBoltControls({ jaggedFrequency2: v }),
      },
      jaggedFrequency3: {
        ...borderBoltControls.jaggedFrequency3,
        value: storeBorderControls.jaggedFrequency3,
        onChange: (v) => setBorderBoltControls({ jaggedFrequency3: v }),
      },
      timeScale: {
        ...borderBoltControls.timeScale,
        value: storeBorderControls.timeScale,
        onChange: (v) => setBorderBoltControls({ timeScale: v }),
      },
      randomness: {
        ...borderBoltControls.randomness,
        value: storeBorderControls.randomness,
        onChange: (v) => setBorderBoltControls({ randomness: v }),
      },
      inset: {
        ...borderBoltControls.inset,
        value: storeBorderControls.inset,
        onChange: (v) => setBorderBoltControls({ inset: v }),
      },
      borderRadius: {
        ...borderBoltControls.borderRadius,
        value: storeBorderControls.borderRadius,
        onChange: (v) => setBorderBoltControls({ borderRadius: v }),
      },
      lineWidth: {
        ...borderBoltControls.lineWidth,
        value: storeBorderControls.lineWidth,
        onChange: (v) => setBorderBoltControls({ lineWidth: v }),
      },
      branchProbability: {
        ...borderBoltControls.branchProbability,
        value: storeBorderControls.branchProbability,
        onChange: (v) => setBorderBoltControls({ branchProbability: v }),
      },
      branchLength: {
        ...borderBoltControls.branchLength,
        value: storeBorderControls.branchLength,
        onChange: (v) => setBorderBoltControls({ branchLength: v }),
      },
      startDelay: {
        ...borderBoltControls.startDelay,
        value: storeBorderControls.startDelay,
        onChange: (v) => setBorderBoltControls({ startDelay: v }),
      },
      roundDuration: {
        ...borderBoltControls.roundDuration,
        value: storeBorderControls.roundDuration,
        onChange: (v) => setBorderBoltControls({ roundDuration: v }),
      },
      growthDuration: {
        ...borderBoltControls.growthDuration,
        value: storeBorderControls.growthDuration,
        onChange: (v) => setBorderBoltControls({ growthDuration: v }),
      },
    },
    { collapsed: true, order: 1, render: () => !isStorybook },
    [storeBorderControls]
  );

  useControls(
    "Travel Bolt",
    {
      boltCount: {
        ...travelBoltControls.boltCount,
        value: storeTravelControls.boltCount,
        onChange: (v) => setTravelBoltControls({ boltCount: v }),
      },
      displacement: {
        ...travelBoltControls.displacement,
        value: storeTravelControls.displacement,
        onChange: (v) => setTravelBoltControls({ displacement: v }),
      },
      jaggedness: {
        ...travelBoltControls.jaggedness,
        value: storeTravelControls.jaggedness,
        onChange: (v) => setTravelBoltControls({ jaggedness: v }),
      },
      branchProbability: {
        ...travelBoltControls.branchProbability,
        value: storeTravelControls.branchProbability,
        onChange: (v) => setTravelBoltControls({ branchProbability: v }),
      },
      branchLength: {
        ...travelBoltControls.branchLength,
        value: storeTravelControls.branchLength,
        onChange: (v) => setTravelBoltControls({ branchLength: v }),
      },
      travelDuration: {
        ...travelBoltControls.travelDuration,
        value: storeTravelControls.travelDuration,
        onChange: (v) => setTravelBoltControls({ travelDuration: v }),
      },
    },
    { collapsed: true, order: 2, render: () => !isStorybook },
    [storeTravelControls]
  );

  useControls(
    "Bolt Demo",
    {
      boltAmount: {
        ...lightningControls.boltAmount,
        value: storeBoltDemoControls.boltAmount,
        onChange: (v) => setBoltDemoControls({ boltAmount: v }),
      },
      displacement: {
        ...lightningControls.displacement,
        value: storeBoltDemoControls.displacement,
        onChange: (v) => setBoltDemoControls({ displacement: v }),
      },
      jaggedness: {
        ...lightningControls.jaggedness,
        value: storeBoltDemoControls.jaggedness,
        onChange: (v) => setBoltDemoControls({ jaggedness: v }),
      },
      segmentPoints: {
        ...lightningControls.segmentPoints,
        value: storeBoltDemoControls.segmentPoints,
        onChange: (v) => setBoltDemoControls({ segmentPoints: v }),
      },
      segmentDensity: {
        ...lightningControls.segmentDensity,
        value: storeBoltDemoControls.segmentDensity,
        onChange: (v) => setBoltDemoControls({ segmentDensity: v }),
      },
      envelopeShape: {
        ...lightningControls.envelopeShape,
        value: storeBoltDemoControls.envelopeShape,
        onChange: (v) => setBoltDemoControls({ envelopeShape: v }),
      },
      smoothingIterations: {
        ...lightningControls.smoothingIterations,
        value: storeBoltDemoControls.smoothingIterations,
        onChange: (v) => setBoltDemoControls({ smoothingIterations: v }),
      },
      lineWidth: {
        ...lightningControls.lineWidth,
        value: storeBoltDemoControls.lineWidth,
        onChange: (v) => setBoltDemoControls({ lineWidth: v }),
      },
      lineWidthVariation: {
        ...lightningControls.lineWidthVariation,
        value: storeBoltDemoControls.lineWidthVariation,
        onChange: (v) => setBoltDemoControls({ lineWidthVariation: v }),
      },
      opacityVariation: {
        ...lightningControls.opacityVariation,
        value: storeBoltDemoControls.opacityVariation,
        onChange: (v) => setBoltDemoControls({ opacityVariation: v }),
      },
      boltColor1: {
        ...lightningControls.boltColor1,
        value: storeBoltDemoControls.boltColor1,
        onChange: (v) => setBoltDemoControls({ boltColor1: v }),
      },
      boltColor2: {
        ...lightningControls.boltColor2,
        value: storeBoltDemoControls.boltColor2,
        onChange: (v) => setBoltDemoControls({ boltColor2: v }),
      },
      boltColor3: {
        ...lightningControls.boltColor3,
        value: storeBoltDemoControls.boltColor3,
        onChange: (v) => setBoltDemoControls({ boltColor3: v }),
      },
      glowDistance: {
        ...lightningControls.glowDistance,
        value: storeBoltDemoControls.glowDistance,
        onChange: (v) => setBoltDemoControls({ glowDistance: v }),
      },
      oscillationCycle: {
        ...lightningControls.oscillationCycle,
        value: storeBoltDemoControls.oscillationCycle,
        onChange: (v) => setBoltDemoControls({ oscillationCycle: v }),
      },
    },
    { collapsed: true, order: 3, render: () => !isStorybook },
    [storeBoltDemoControls]
  );

  return (
    <>
      {isBorderAnimating && (
        <BorderBoltGfx {...storeBorderControls} startPosition={touchPosition} />
      )}
      {Array.from({ length: storeTravelControls.boltCount }).map((_, index) => (
        <LightningTravelGfx
          key={`travel-bolt-${index}`}
          fromCell={previousCell}
          toCell={focusedCell}
          {...storeTravelControls}
          seed={index}
          onConnect={index === 0 ? handleBoltConnect : undefined}
        />
      ))}
      {showBoltDemo && (
        <LightningGfx
          width={width}
          height={height}
          {...storeBoltDemoControls}
          boltColors={[
            storeBoltDemoControls.boltColor1,
            storeBoltDemoControls.boltColor2,
            storeBoltDemoControls.boltColor3,
          ]}
          regenerateKey={regenerateKey}
        />
      )}
    </>
  );
}
