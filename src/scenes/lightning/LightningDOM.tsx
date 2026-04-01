import { useControls, button } from "leva";

import { GridOverlay } from "src/scenes/lightning/GridOverlay";
import { useLightningStore } from "src/scenes/lightning/useLightningStore";

const isStorybook = import.meta.env.VITE_IN_STORYBOOK === "true";

type LightningDOMProps = {
  onToggleBoltDemo?: () => void;
  onRegenerate?: () => void;
};

export function LightningDOM(props: LightningDOMProps) {
  const { onToggleBoltDemo: sbToggleBoltDemo, onRegenerate: sbRegenerate } =
    props;
  const { focusedCell, handleCellClick, toggleBoltDemo, regenerate } =
    useLightningStore();

  // Action buttons - only show in Leva when not in Storybook
  useControls(
    "Actions",
    {
      "Toggle Bolt Demo": button(() => {
        toggleBoltDemo();
        if (sbToggleBoltDemo) sbToggleBoltDemo();
      }),
      Regenerate: button(() => {
        regenerate();
        if (sbRegenerate) sbRegenerate();
      }),
    },
    { order: 0, render: () => !isStorybook }
  );

  return (
    <GridOverlay focusedCell={focusedCell} onCellClick={handleCellClick} />
  );
}
