import React from "react";
import { Suspense, lazy, useState } from "react";
import "./App.css";

const ThemeLoader = {
  HelloWorld: () => import("./hello-world/HelloWorld"),
  // Add more scenes here
};

export default function App() {
  const [scene, setScene] = useState<JSX.Element | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  const loadScene = (sceneName: keyof typeof ThemeLoader) => {
    setActiveTheme(sceneName);
    setScene(
      <Suspense fallback={<div>Loading...</div>}>
        {React.createElement(lazy(ThemeLoader[sceneName]))}
      </Suspense>
    );
  };

  return (
    <div>
      <h1>Pixi React Tutorials</h1>
      <div className="button-list">
        <button
          onClick={() => loadScene("HelloWorld")}
          className={activeTheme === "HelloWorld" ? "active" : ""}
        >
          Hello World
        </button>
        {/* Add more buttons for other scenes here */}
      </div>
      {scene}
    </div>
  );
}
