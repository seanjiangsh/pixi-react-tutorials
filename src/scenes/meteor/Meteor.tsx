import { useControls, button } from "leva";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { SceneProps } from "src/scenes/Scenes";
import {
  MeteorGfx,
  PathTypes,
  type PathType,
} from "src/scenes/meteor/MeteorGfx";
import { useMeteorStore } from "src/scenes/meteor/useMeteorStore";

const isStorybook = import.meta.env.VITE_IN_STORYBOOK === "true";

export type MeteorProps = SceneProps & {
  pathType?: PathType;
  startRatio?: number;
  shrinkDuration?: number;
  baseBlur?: number;
  layers?: number;
};

export default function Meteor(props: MeteorProps) {
  const { isPixi } = props;
  const {
    pathType: pathTypeProp,
    startRatio: startRatioProp,
    shrinkDuration: shrinkDurationProp,
    baseBlur: baseBlurProp,
    layers: layersProp,
  } = props;

  const { width, height } = useSceneSize();
  const { resetKey, resetAnimation } = useMeteorStore();

  const controls = useControls(
    "Meteor",
    {
      pathType: {
        value: pathTypeProp ?? "rect",
        options: PathTypes,
        label: "Path Type",
      },
      startRatio: {
        value: startRatioProp ?? 1.1,
        min: 1.0,
        max: 2.0,
        step: 0.1,
        label: "Start Ratio",
      },
      shrinkDuration: {
        value: shrinkDurationProp ?? 2,
        min: 0.5,
        max: 5,
        step: 0.5,
        label: "Shrink Duration (s)",
      },
      baseBlur: {
        value: baseBlurProp ?? 3,
        min: 0,
        max: 10,
        step: 1,
        label: "Base Blur",
      },
      layers: {
        value: layersProp ?? 10,
        min: 5,
        max: 20,
        step: 1,
        label: "Layers",
      },
      "Reset Animation": button(() => resetAnimation()),
    },
    { collapsed: true, order: 1, render: () => !isStorybook }
  );

  // Use prop values if provided, otherwise use controls
  const pathType = pathTypeProp ?? (controls.pathType as PathType);
  const startRatio = startRatioProp ?? controls.startRatio;
  const shrinkDuration = shrinkDurationProp ?? controls.shrinkDuration;
  const baseBlur = baseBlurProp ?? controls.baseBlur;
  const layers = layersProp ?? controls.layers;

  if (!isPixi) return null;
  return (
    <MeteorGfx
      key={resetKey}
      width={width}
      height={height}
      pathType={pathType}
      startRatio={startRatio}
      shrinkDuration={shrinkDuration}
      baseBlur={baseBlur}
      layers={layers}
    />
  );
}
