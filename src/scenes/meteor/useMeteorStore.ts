import { create } from "zustand";

type MeteorState = {
  resetKey: number;
};

type MeteorActions = {
  resetAnimation: () => void;
};

type MeteorStore = MeteorState & MeteorActions;

export const useMeteorStore = create<MeteorStore>((set) => ({
  // Initial state
  resetKey: 0,

  // Actions
  resetAnimation: () => set((state) => ({ resetKey: state.resetKey + 1 })),
}));
