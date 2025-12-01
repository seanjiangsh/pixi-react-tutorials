import { SceneProps } from "src/scenes/Scenes";
import { SpotlightDOM } from "src/scenes/spotlight/SpotlightDOM";
import { SpotlightPixi } from "src/scenes/spotlight/SpotlightPixi";

export default function Spotlight({ isPixi }: SceneProps) {
  if (isPixi) {
    return <SpotlightPixi />;
  } else {
    return <SpotlightDOM />;
  }
}
