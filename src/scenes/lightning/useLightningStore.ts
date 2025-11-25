import { create } from "zustand";

type LightningState = {
  focusedCell: { col: number; row: number };
  previousCell: { col: number; row: number };
  touchPosition: { x: number; y: number } | null;
  isBorderAnimating: boolean;
  showBoltDemo: boolean;
  regenerateKey: number;
};

type LightningActions = {
  setFocusedCell: (cell: { col: number; row: number }) => void;
  handleCellClick: (col: number, row: number) => void;
  setTouchPosition: (position: { x: number; y: number } | null) => void;
  setIsBorderAnimating: (animating: boolean) => void;
  handleBoltConnect: (point: { x: number; y: number }) => void;
  toggleBoltDemo: () => void;
  regenerate: () => void;
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
}));
