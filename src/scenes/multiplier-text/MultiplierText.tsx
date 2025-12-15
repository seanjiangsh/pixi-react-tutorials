import { SceneProps } from "src/scenes/Scenes";
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
  if (!isPixi) return null;

  return <MultiplierTextPixi />;
}
