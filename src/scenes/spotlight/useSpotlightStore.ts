import { create } from "zustand";
import {
  debugControls,
  spotlightControls,
  animationControls,
} from "src/scenes/spotlight/spotlightControls";
import type {
  DebugProps,
  SpotlightProps,
  AnimationProps,
} from "src/scenes/spotlight/spotlightControls";

// Helper to extract default values from control configs
const getDebugDefaults = (): Required<DebugProps> =>
  Object.fromEntries(
    Object.entries(debugControls).map(([key, config]) => [key, config.value])
  ) as Required<DebugProps>;

const getSpotlightDefaults = (): Required<SpotlightProps> =>
  Object.fromEntries(
    Object.entries(spotlightControls).map(([key, config]) => [
      key,
      config.value,
    ])
  ) as Required<SpotlightProps>;

const getAnimationDefaults = (): Required<AnimationProps> =>
  Object.fromEntries(
    Object.entries(animationControls).map(([key, config]) => [
      key,
      config.value,
    ])
  ) as Required<AnimationProps>;

type AnimationPhase = "searching" | "focusing" | "expanding" | "complete";

type SpotlightState = {
  focusedCells: number[];
  animationPhase: AnimationPhase;
  // Control states
  debugControls: Required<DebugProps>;
  spotlightControls: Required<SpotlightProps>;
  animationControls: Required<AnimationProps>;
};

type SpotlightActions = {
  setFocusedCells: (cells: number[]) => void;
  toggleCell: (cellIndex: number) => void;
  clearFocusedCells: () => void;
  focusRandom: (count: number) => void;
  setAnimationPhase: (phase: AnimationPhase) => void;
  startAnimation: () => void;
  nextPhase: () => void;
  resetAnimation: () => void;
  // Control actions
  setDebugControls: (controls: Partial<DebugProps>) => void;
  setSpotlightControls: (controls: Partial<SpotlightProps>) => void;
  setAnimationControls: (controls: Partial<AnimationProps>) => void;
};

type SpotlightStore = SpotlightState & SpotlightActions;

export const useSpotlightStore = create<SpotlightStore>((set, get) => ({
  // Initial state
  focusedCells: [],
  animationPhase: "searching",
  debugControls: getDebugDefaults(),
  spotlightControls: getSpotlightDefaults(),
  animationControls: getAnimationDefaults(),

  // Actions
  setFocusedCells: (cells) => set({ focusedCells: cells }),

  toggleCell: (cellIndex) =>
    set((state) => {
      const cells = state.focusedCells;
      const index = cells.indexOf(cellIndex);
      if (index >= 0) {
        return { focusedCells: cells.filter((c) => c !== cellIndex) };
      } else {
        return { focusedCells: [...cells, cellIndex] };
      }
    }),

  clearFocusedCells: () => set({ focusedCells: [] }),

  focusRandom: (count) => {
    const randomCells: number[] = [];
    const availableCells = Array.from({ length: 37 }, (_, i) => i);

    for (let i = 0; i < Math.min(count, 37); i++) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      randomCells.push(availableCells[randomIndex]);
      availableCells.splice(randomIndex, 1);
    }

    set({ focusedCells: randomCells });
  },

  setAnimationPhase: (phase) => set({ animationPhase: phase }),

  startAnimation: () => {
    const { spotlightControls } = get();
    // Select random cells if none selected
    if (get().focusedCells.length === 0) {
      get().focusRandom(spotlightControls.spotlightCount);
    }
    set({ animationPhase: "focusing" });
  },

  nextPhase: () => {
    const currentPhase = get().animationPhase;
    const phaseOrder: AnimationPhase[] = [
      "searching",
      "focusing",
      "expanding",
      "complete",
    ];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phaseOrder.length;
    set({ animationPhase: phaseOrder[nextIndex] });
  },

  resetAnimation: () => {
    set({
      animationPhase: "searching",
      focusedCells: [],
    });
  },

  // Control actions
  setDebugControls: (controls) =>
    set((state) => ({
      debugControls: { ...state.debugControls, ...controls },
    })),

  setSpotlightControls: (controls) =>
    set((state) => ({
      spotlightControls: { ...state.spotlightControls, ...controls },
    })),

  setAnimationControls: (controls) =>
    set((state) => ({
      animationControls: { ...state.animationControls, ...controls },
    })),
}));
