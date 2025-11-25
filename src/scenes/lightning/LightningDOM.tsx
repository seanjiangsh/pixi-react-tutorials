import { useControls, button } from "leva";

import {
  lightningControls,
  borderBoltControls,
  travelBoltControls,
} from "src/scenes/lightning/lightningControls";
import { GridOverlay } from "src/scenes/lightning/GridOverlay";
import { useLightningStore } from "src/scenes/lightning/useLightningStore";

export function LightningDOM() {
  const { focusedCell, handleCellClick, toggleBoltDemo, regenerate } =
    useLightningStore();

  // Leva controls with proper ordering
  useControls("Border Bolt", borderBoltControls, { collapsed: true, order: 1 });
  useControls("Travel Bolt", travelBoltControls, { collapsed: true, order: 2 });
  useControls(
    "Bolt Demo",
    {
      ...lightningControls,
      "Toggle bolts Demo": button(() => toggleBoltDemo()),
      Regenerate: button(() => regenerate()),
    },
    { collapsed: true, order: 3 }
  );

  return (
    <GridOverlay focusedCell={focusedCell} onCellClick={handleCellClick} />
  );
}
