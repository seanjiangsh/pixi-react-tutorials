import { useControls, folder } from "leva";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Scenes, type SceneName } from "src/scenes/Scenes";
import { useSceneStore } from "src/stores/useSceneStore";

export function GlobalControls() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentScene, showPixiStats, setCurrentScene, setShowPixiStats } =
    useSceneStore();

  // Prevent Leva's initial onChange from navigating and overriding deep links
  const initializedRef = useRef(false);
  useEffect(() => {
    initializedRef.current = true;
  }, []);

  // Sync URL with store on mount and navigation
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const sceneFromPath = Object.keys(Scenes).find(
      (name) => `/${name.toLowerCase()}` === path
    ) as SceneName | undefined;

    if (sceneFromPath && sceneFromPath !== currentScene) {
      setCurrentScene(sceneFromPath);
    }
  }, [location.pathname, currentScene, setCurrentScene]);

  const sceneOptions = Object.keys(Scenes).reduce((acc, name) => {
    acc[name] = name;
    return acc;
  }, {} as Record<string, string>);

  useControls("Scenes", {
    Scene: {
      value: currentScene,
      options: sceneOptions,
      onChange: (value: string) => {
        const sceneName = value as SceneName;
        setCurrentScene(sceneName);
        // Only navigate after initial mount to avoid overriding the hash route
        if (!initializedRef.current) return;
        navigate(`/${sceneName.toLowerCase()}`);
      },
    },
  });

  useControls(
    "Misc",
    {
      "Pixi Stats": folder({
        "Show Stats": {
          value: showPixiStats,
          onChange: (value: boolean) => {
            setShowPixiStats(value);
          },
        },
      }),
    },
    { collapsed: true, order: 9999 }
  );

  return null;
}
