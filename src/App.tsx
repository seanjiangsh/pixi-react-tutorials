import { Routes, Route, Navigate } from "react-router-dom";
import "src/App.css";

import { Scenes } from "src/scenes/Scenes";
import Header from "src/components/Header";
import Scene from "src/components/Scene";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/cap" replace />} />
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
