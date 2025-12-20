import { create } from "zustand";
import type { SceneName } from "src/scenes/Scenes";

type SceneStore = {
  currentScene: SceneName;
  showPixiStats: boolean;
  canvasPointerEvents: "auto" | "none";
  setCurrentScene: (scene: SceneName) => void;
  setShowPixiStats: (show: boolean) => void;
  setCanvasPointerEvents: (value: "auto" | "none") => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  currentScene: "Svg-Parser",
  showPixiStats: true,
  canvasPointerEvents: "auto",
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setShowPixiStats: (show) => set({ showPixiStats: show }),
  setCanvasPointerEvents: (value) => set({ canvasPointerEvents: value }),
}));
