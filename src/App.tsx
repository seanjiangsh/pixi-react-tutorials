import { useState } from "react";
import "./App.css";

import { ThemeName } from "./scenes/sceneLoader";
import Header from "./components/Header";
import Scene from "./components/Scene";

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
