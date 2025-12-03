import { Link, useLocation } from "react-router-dom";
import { Scenes } from "src/scenes/Scenes";
import "src/components/SceneButtonList.css";

export default function SceneButtonList() {
  const location = useLocation();

  return (
    <div className="button-list">
      {Object.keys(Scenes).map((sceneName) => {
        const path = `/${sceneName.toLowerCase()}`;
        const isActive = location.pathname === path;

        return (
          <Link
            key={sceneName}
            to={path}
            className={isActive ? "active" : ""}
            style={{ textDecoration: "none" }}
          >
            <button className={isActive ? "active" : ""} disabled={isActive}>
              {sceneName}
            </button>
          </Link>
        );
      })}
    </div>
  );
}
