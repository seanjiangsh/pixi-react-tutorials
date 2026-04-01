import { create } from "zustand";
import { Scenes, type SceneName } from "src/scenes/Scenes";

type SceneStore = {
  currentScene: SceneName;
  showPixiStats: boolean;
  canvasPointerEvents: "auto" | "none";
  setCurrentScene: (scene: SceneName) => void;
  setShowPixiStats: (show: boolean) => void;
  setCanvasPointerEvents: (value: "auto" | "none") => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  // Default; will be set from hash via init function (see below)
  currentScene: "Grid-Board",
  showPixiStats: true,
  canvasPointerEvents: "auto",
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setShowPixiStats: (show) => set({ showPixiStats: show }),
  setCanvasPointerEvents: (value) => set({ canvasPointerEvents: value }),
}));

// Resolve scene name from current window hash (HashRouter), with debug logging
export function resolveSceneFromHash(defaultScene: SceneName): SceneName {
  try {
    const rawHash = typeof window !== "undefined" ? window.location.hash : "";
    const path = rawHash.startsWith("#/")
      ? rawHash.slice(2)
      : rawHash.replace(/^#/, "");

    const match = Object.keys(Scenes).find(
      (name) => name.toLowerCase() === path.toLowerCase()
    ) as SceneName | undefined;

    console.log("[SceneStore] resolveSceneFromHash:", {
      rawHash,
      parsedPath: path,
      matched: match ?? null,
    });

    return match ?? defaultScene;
  } catch (err) {
    console.log("[SceneStore] resolveSceneFromHash error:", err);
    return defaultScene;
  }
}

// Initialize store from hash once (before app render), with debug logging
export function initSceneFromHash(): void {
  try {
    const defaultScene: SceneName = useSceneStore.getState().currentScene;
    const scene = resolveSceneFromHash(defaultScene);
    useSceneStore.setState({ currentScene: scene });
    console.log("[SceneStore] initSceneFromHash set currentScene:", scene);
  } catch (err) {
    console.log("[SceneStore] initSceneFromHash error:", err);
  }
}
