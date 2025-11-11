import "src/components/Header.css";
import SceneButtonList from "src/components/SceneButtonList";

import { type ThemeName } from "src/scenes/sceneLoader";

type HeaderProps = {
  activeTheme: ThemeName | null;
  loadScene: (sceneName: ThemeName) => void;
};

export default function Header(props: HeaderProps) {
  const { activeTheme, loadScene } = props;

  return (
    <header>
      <h1>Pixi React</h1>
      <SceneButtonList activeTheme={activeTheme} loadScene={loadScene} />
    </header>
  );
}
