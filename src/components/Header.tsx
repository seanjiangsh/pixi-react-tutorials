import "src/components/Header.css";
import SceneButtonList from "src/components/SceneButtonList";

import { type SceneName } from "src/scenes/Scenes";

type HeaderProps = {
  activeTheme: SceneName | null;
  loadScene: (sceneName: SceneName) => void;
};

export default function Header(props: HeaderProps) {
  const { activeTheme, loadScene } = props;

  return (
    <header>
      <h3>Scenes</h3>
      <SceneButtonList activeTheme={activeTheme} loadScene={loadScene} />
    </header>
  );
}
