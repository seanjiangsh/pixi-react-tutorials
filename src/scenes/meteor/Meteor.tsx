import React from "react";
import { Application } from "@pixi/react";
import { useControls, button, Leva } from "leva";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { SceneProps } from "src/scenes/Scenes";
import {
  MeteorGraphics,
  PathTypes,
  type PathType,
} from "src/scenes/meteor/MeteorGraphics";

export default function Meteor({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();

  const [resetKey, setResetKey] = React.useState(0);

  const controls = useControls("Meteor", {
    pathType: {
      value: "rect",
      options: PathTypes,
      label: "Path Type",
    },
    startRatio: {
      value: 1.1,
      min: 1.0,
      max: 2.0,
      step: 0.1,
      label: "Start Ratio",
    },
    shrinkDuration: {
      value: 2,
      min: 0.5,
      max: 5,
      step: 0.5,
      label: "Shrink Duration (s)",
    },
    baseBlur: {
      value: 3,
      min: 0,
      max: 10,
      step: 1,
      label: "Base Blur",
    },
    layers: {
      value: 10,
      min: 5,
      max: 20,
      step: 1,
      label: "Layers",
    },
    "Reset Animation": button(() => setResetKey((prev) => prev + 1)),
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
        <MeteorGraphics
          key={resetKey}
          width={width}
          height={height}
          pathType={controls.pathType as PathType}
          startRatio={controls.startRatio}
          shrinkDuration={controls.shrinkDuration}
          baseBlur={controls.baseBlur}
          layers={controls.layers}
        />
      </Application>
      <Leva collapsed={true} />
    </>
  );
}
