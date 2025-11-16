import React from "react";
import { Application } from "@pixi/react";

import useSceneSize from "src/utils/useSceneSize";
import { SceneProps } from "src/scenes/sceneLoader";
import { MeteorGraphics } from "src/scenes/meteor/MeteorGraphics";

export default function Meteor({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();

  const [pathType, setPathType] = React.useState<"rect" | "circle">("rect");
  const [resetKey, setResetKey] = React.useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };

  const handlePathTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPathType(e.target.value as "rect" | "circle");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Application
        width={width}
        height={height}
        background={0x0a0e27}
        resizeTo={containerRef}
        antialias
      >
        <MeteorGraphics
          key={resetKey}
          width={width}
          height={height}
          startRatio={1.1}
          baseBlur={3}
          layers={10}
          pathType={pathType}
        />
      </Application>
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <button
          onClick={handleReset}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3d3228",
            color: "#fff",
            border: "1px solid #6a5a48",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Reset Animation
        </button>
        <select
          value={pathType}
          onChange={handlePathTypeChange}
          style={{
            padding: "8px 12px",
            backgroundColor: "#3d3228",
            color: "#fff",
            border: "1px solid #6a5a48",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <option value="rect">Rectangle Path</option>
          <option value="circle">Circle Path</option>
        </select>
      </div>
    </div>
  );
}
