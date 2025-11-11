import { ThemeLoader, type ThemeName } from "src/scenes/sceneLoader";
import "src/components/SceneButtonList.css";

type SceneButtonListProps = {
  activeTheme: ThemeName | null;
  loadScene: (sceneName: ThemeName) => void;
};

export default function SceneButtonList(props: SceneButtonListProps) {
  const { activeTheme, loadScene } = props;

  return (
    <div className="button-list">
      {Object.entries(ThemeLoader).map(([themeName]) => (
        <button
          key={themeName}
          onClick={() => loadScene(themeName as ThemeName)}
          className={activeTheme === themeName ? "active" : ""}
          disabled={activeTheme === themeName}
        >
          {themeName}
        </button>
      ))}
    </div>
  );
}
