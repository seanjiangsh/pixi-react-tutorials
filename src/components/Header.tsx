import "src/components/Header.css";
import SceneButtonList from "src/components/SceneButtonList";

export default function Header() {
  return (
    <header>
      <h3>Scenes</h3>
      <SceneButtonList />
    </header>
  );
}
