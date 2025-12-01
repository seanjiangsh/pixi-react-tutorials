import { useState } from "react";
import "src/App.css";

import { SceneName } from "src/scenes/Scenes";
import Header from "src/components/Header";
import Scene from "src/components/Scene";

export default function App() {
  const [activeTheme, setActiveTheme] = useState<SceneName>("Spotlight");

  const loadScene = (sceneName: SceneName) => {
    setActiveTheme(sceneName);
  };

  return (
    <>
      <Header activeTheme={activeTheme} loadScene={loadScene} />
      {activeTheme && <Scene sceneName={activeTheme} />}
    </>
  );
}
