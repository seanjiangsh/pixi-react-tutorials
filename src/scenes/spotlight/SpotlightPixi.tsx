import { useControls } from "leva";

import { SpotlightGfx } from "src/scenes/spotlight/SpotlightGfx";
import {
  debugControls,
  spotlightControls,
  animationControls,
} from "src/scenes/spotlight/spotlightControls";
import { useSpotlightStore } from "src/scenes/spotlight/useSpotlightStore";

const isStorybook = import.meta.env.VITE_IN_STORYBOOK === "true";

export function SpotlightPixi() {
  const {
    debugControls: storeDebugControls,
    setDebugControls,
    spotlightControls: storeSpotlightControls,
    setSpotlightControls,
    animationControls: storeAnimationControls,
    setAnimationControls,
    animationPhase,
    focusedCells,
    nextPhase,
  } = useSpotlightStore();

  // Debug controls
  useControls(
    "Controls.Debug",
    {
      showDimming: {
        ...debugControls.showDimming,
        value: storeDebugControls.showDimming,
        onChange: (v) => setDebugControls({ showDimming: v }),
      },
      showBoard: {
        ...debugControls.showBoard,
        value: storeDebugControls.showBoard,
        onChange: (v) => setDebugControls({ showBoard: v }),
      },
      dimmingOpacity: {
        ...debugControls.dimmingOpacity,
        value: storeDebugControls.dimmingOpacity,
        onChange: (v) => setDebugControls({ dimmingOpacity: v }),
      },
    },
    { collapsed: true, order: 9998, render: () => !isStorybook },
    [storeDebugControls]
  );

  // Spotlight controls
  useControls(
    "Controls.Spotlight",
    {
      spotlightCount: {
        ...spotlightControls.spotlightCount,
        value: storeSpotlightControls.spotlightCount,
        onChange: (v) => setSpotlightControls({ spotlightCount: v }),
      },
      spotlightRadius: {
        ...spotlightControls.spotlightRadius,
        value: storeSpotlightControls.spotlightRadius,
        onChange: (v) => setSpotlightControls({ spotlightRadius: v }),
      },
      maxSpeed: {
        ...spotlightControls.maxSpeed,
        value: storeSpotlightControls.maxSpeed,
        onChange: (v) => setSpotlightControls({ maxSpeed: v }),
      },
      acceleration: {
        ...spotlightControls.acceleration,
        value: storeSpotlightControls.acceleration,
        onChange: (v) => setSpotlightControls({ acceleration: v }),
      },
      friction: {
        ...spotlightControls.friction,
        value: storeSpotlightControls.friction,
        onChange: (v) => setSpotlightControls({ friction: v }),
      },
      glowStrength: {
        ...spotlightControls.glowStrength,
        value: storeSpotlightControls.glowStrength,
        onChange: (v) => setSpotlightControls({ glowStrength: v }),
      },
    },
    { collapsed: true, order: 9997, render: () => !isStorybook },
    [storeSpotlightControls]
  );

  // Animation controls
  useControls(
    "Controls.Animation",
    {
      autoAdvance: {
        ...animationControls.autoAdvance,
        value: storeAnimationControls.autoAdvance,
        onChange: (v) => setAnimationControls({ autoAdvance: v }),
      },
      focusDuration: {
        ...animationControls.focusDuration,
        value: storeAnimationControls.focusDuration,
        onChange: (v) => setAnimationControls({ focusDuration: v }),
      },
      expandDuration: {
        ...animationControls.expandDuration,
        value: storeAnimationControls.expandDuration,
        onChange: (v) => setAnimationControls({ expandDuration: v }),
      },
      expandPause: {
        ...animationControls.expandPause,
        value: storeAnimationControls.expandPause,
        onChange: (v) => setAnimationControls({ expandPause: v }),
      },
      velocityWeight: {
        ...animationControls.velocityWeight,
        value: storeAnimationControls.velocityWeight,
        onChange: (v) => setAnimationControls({ velocityWeight: v }),
      },
    },
    { collapsed: true, order: 9996, render: () => !isStorybook },
    [storeAnimationControls]
  );

  return (
    <SpotlightGfx
      showDimming={storeDebugControls.showDimming}
      dimmingOpacity={storeDebugControls.dimmingOpacity}
      spotlightCount={storeSpotlightControls.spotlightCount}
      spotlightRadius={storeSpotlightControls.spotlightRadius}
      maxSpeed={storeSpotlightControls.maxSpeed}
      acceleration={storeSpotlightControls.acceleration}
      friction={storeSpotlightControls.friction}
      animationPhase={animationPhase}
      focusedCells={focusedCells}
      animationControls={storeAnimationControls}
      cellCornersCache={new Map()}
      onPhaseComplete={nextPhase}
    />
  );
}
