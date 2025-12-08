import { Routes, Route } from "react-router-dom";
import "src/App.css";

import { Scenes } from "src/scenes/Scenes";
import { GlobalControls } from "src/components/GlobalControls";
import Scene from "src/components/Scene";

export default function App() {
  return (
    <>
      <GlobalControls />
      <Routes>
        {Object.keys(Scenes).map((sceneName) => (
          <Route
            key={sceneName}
            path={`/${sceneName.toLowerCase()}`}
            element={<Scene sceneName={sceneName as keyof typeof Scenes} />}
          />
        ))}
      </Routes>
    </>
  );
}
