import { create } from "zustand";
import {
  borderBoltControls,
  travelBoltControls,
  lightningControls,
} from "src/scenes/lightning/lightningControls";
import type {
  BorderBoltProps,
  TravelBoltProps,
  BoltDemoProps,
} from "src/scenes/lightning/Lightning";

// Helper to extract default values from control configs
const getBorderBoltDefaults = (): Required<BorderBoltProps> =>
  Object.fromEntries(
    Object.entries(borderBoltControls).map(([key, config]) => [
      key,
      config.value,
    ])
  ) as Required<BorderBoltProps>;

const getTravelBoltDefaults = (): Required<TravelBoltProps> =>
  Object.fromEntries(
    Object.entries(travelBoltControls).map(([key, config]) => [
      key,
      config.value,
    ])
  ) as Required<TravelBoltProps>;

const getBoltDemoDefaults = (): Required<BoltDemoProps> =>
  Object.fromEntries(
    Object.entries(lightningControls).map(([key, config]) => [
      key,
      config.value,
    ])
  ) as Required<BoltDemoProps>;

type LightningState = {
  focusedCell: { col: number; row: number };
  previousCell: { col: number; row: number };
  touchPosition: { x: number; y: number } | null;
  isBorderAnimating: boolean;
  showBoltDemo: boolean;
  regenerateKey: number;
  // Control states
  borderBoltControls: Required<BorderBoltProps>;
  travelBoltControls: Required<TravelBoltProps>;
  boltDemoControls: Required<BoltDemoProps>;
};

type LightningActions = {
  setFocusedCell: (cell: { col: number; row: number }) => void;
  handleCellClick: (col: number, row: number) => void;
  setTouchPosition: (position: { x: number; y: number } | null) => void;
  setIsBorderAnimating: (animating: boolean) => void;
  handleBoltConnect: (point: { x: number; y: number }) => void;
  toggleBoltDemo: () => void;
  regenerate: () => void;
  // Control actions
  setBorderBoltControls: (controls: Partial<BorderBoltProps>) => void;
  setTravelBoltControls: (controls: Partial<TravelBoltProps>) => void;
  setBoltDemoControls: (controls: Partial<BoltDemoProps>) => void;
};

type LightningStore = LightningState & LightningActions;

export const useLightningStore = create<LightningStore>((set, get) => ({
  // Initial state
  focusedCell: { col: 0, row: 0 },
  previousCell: { col: 0, row: 0 },
  touchPosition: null,
  isBorderAnimating: true, // Start animating on initial load
  showBoltDemo: false,
  regenerateKey: 0,
  borderBoltControls: getBorderBoltDefaults(),
  travelBoltControls: getTravelBoltDefaults(),
  boltDemoControls: getBoltDemoDefaults(),

  // Actions
  setFocusedCell: (cell) =>
    set((state) => ({
      previousCell: state.focusedCell,
      focusedCell: cell,
    })),

  handleCellClick: (col, row) => {
    const { focusedCell } = get();
    const isSameCell = focusedCell.col === col && focusedCell.row === row;
    const isResetToOrigin = col === 0 && row === 0;

    set({
      previousCell: focusedCell,
      focusedCell: { col, row },
      // If same cell (reset) or reset to origin (from grid resize), start animating immediately. Otherwise wait for travel bolt
      isBorderAnimating: isSameCell || isResetToOrigin,
      touchPosition: null,
    });
  },

  setTouchPosition: (position) => set({ touchPosition: position }),

  setIsBorderAnimating: (animating) => set({ isBorderAnimating: animating }),

  handleBoltConnect: (point) =>
    set({
      touchPosition: point,
      isBorderAnimating: true,
    }),

  toggleBoltDemo: () => set((state) => ({ showBoltDemo: !state.showBoltDemo })),

  regenerate: () =>
    set((state) => ({ regenerateKey: state.regenerateKey + 1 })),

  // Control actions
  setBorderBoltControls: (controls) =>
    set((state) => ({
      borderBoltControls: { ...state.borderBoltControls, ...controls },
    })),

  setTravelBoltControls: (controls) =>
    set((state) => ({
      travelBoltControls: { ...state.travelBoltControls, ...controls },
    })),

  setBoltDemoControls: (controls) =>
    set((state) => ({
      boltDemoControls: { ...state.boltDemoControls, ...controls },
    })),
}));
