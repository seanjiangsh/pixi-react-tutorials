import { useState } from "react";
import "src/App.css";

import { ThemeName } from "src/scenes/sceneLoader";
import Header from "src/components/Header";
import Scene from "src/components/Scene";

export default function App() {
  const [activeTheme, setActiveTheme] = useState<ThemeName | null>(null);

  const loadScene = (sceneName: ThemeName) => {
    setActiveTheme(sceneName);
  };

  return (
    <>
      <Header activeTheme={activeTheme} loadScene={loadScene} />
      {activeTheme && <Scene sceneName={activeTheme} />}
    </>
  );
}
