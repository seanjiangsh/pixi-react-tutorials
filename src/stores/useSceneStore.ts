import { create } from "zustand";
import type { SceneName } from "src/scenes/Scenes";

type SceneStore = {
  currentScene: SceneName;
  showPixiStats: boolean;
  setCurrentScene: (scene: SceneName) => void;
  setShowPixiStats: (show: boolean) => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  currentScene: "Grid-board",
  showPixiStats: true,
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setShowPixiStats: (show) => set({ showPixiStats: show }),
}));
