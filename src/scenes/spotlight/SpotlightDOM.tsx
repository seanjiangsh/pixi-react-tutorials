import { useControls, button } from "leva";
import { RouletteBoard } from "src/scenes/spotlight/RouletteBoard";
import { useSpotlightStore } from "src/scenes/spotlight/useSpotlightStore";

const isStorybook = import.meta.env.VITE_IN_STORYBOOK === "true";

export function SpotlightDOM() {
  const {
    focusedCells,
    toggleCell,
    startAnimation,
    resetAnimation,
    focusRandom,
    spotlightControls,
    debugControls,
  } = useSpotlightStore();

  // Only show controls in non-Storybook mode
  useControls(
    "Actions",
    {
      "Start Animation": button(() => startAnimation()),
      "Focus Random": button(() =>
        focusRandom(spotlightControls.spotlightCount)
      ),
      Reset: button(() => resetAnimation()),
    },
    { collapsed: true, order: 3, render: () => !isStorybook },
    [spotlightControls.spotlightCount]
  );

  const handleCellClick = (cellIndex: number) => {
    toggleCell(cellIndex);
  };

  return (
    <>
      {debugControls.showBoard && (
        <RouletteBoard
          focusedCells={focusedCells}
          onCellClick={handleCellClick}
        />
      )}
    </>
  );
}
