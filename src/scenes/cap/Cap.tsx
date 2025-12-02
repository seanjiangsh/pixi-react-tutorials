import { SceneProps } from "src/scenes/Scenes";
import { CapPixi } from "src/scenes/cap/CapPixi";

export default function Cap({ isPixi }: SceneProps) {
  if (!isPixi) return null;

  return <CapPixi />;
}
