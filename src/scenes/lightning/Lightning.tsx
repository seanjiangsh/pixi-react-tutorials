import { SceneProps } from "src/scenes/Scenes";
import { LightningDOM } from "src/scenes/lightning/LightningDOM";
import { LightningPixi } from "src/scenes/lightning/LightningPixi";

export default function Lightning({ isPixi }: SceneProps) {
  if (isPixi) {
    return <LightningPixi />;
  } else {
    return <LightningDOM />;
  }
}
