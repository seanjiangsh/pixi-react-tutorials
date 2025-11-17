import { Scenes, type SceneName } from "src/scenes/Scenes";
import "src/components/SceneButtonList.css";

type SceneButtonListProps = {
  activeTheme: SceneName | null;
  loadScene: (sceneName: SceneName) => void;
};

export default function SceneButtonList(props: SceneButtonListProps) {
  const { activeTheme, loadScene } = props;

  return (
    <div className="button-list">
      {Object.entries(Scenes).map(([SceneName]) => (
        <button
          key={SceneName}
          onClick={() => loadScene(SceneName as SceneName)}
          className={activeTheme === SceneName ? "active" : ""}
          disabled={activeTheme === SceneName}
        >
          {SceneName}
        </button>
      ))}
    </div>
  );
}
