import { useEffect } from "react";
import { SceneProps } from "src/scenes/Scenes";
import { useSceneStore } from "src/stores/useSceneStore";
import { MultiplierTextPixi } from "src/scenes/multiplier-text/MultiplierTextPixi";

export type MultiplierTextProps = SceneProps & {
  targetValue?: number;
  fadeInDuration?: number;
  countDuration?: number;
  fontSize?: number;
  textColor?: string;
  effect?: string;
};

export default function MultiplierText({ isPixi }: MultiplierTextProps) {
  const { setCanvasPointerEvents } = useSceneStore();

  useEffect(() => {
    setCanvasPointerEvents("auto");
  }, [setCanvasPointerEvents]);

  if (!isPixi) return null;

  return <MultiplierTextPixi />;
}
