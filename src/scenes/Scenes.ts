import HelloWorld from "src/scenes/hello-world/HelloWorld";
// import CountDown from "src/scenes/count-down/CountDown";
import Meteor from "src/scenes/meteor/Meteor";
import Lightning from "src/scenes/lightning/Lightning";
import Spotlight from "src/scenes/spotlight/Spotlight";
import Cap from "src/scenes/cap/Cap";
import MultiplierText from "src/scenes/multiplier-text/MultiplierText";
import GridBoard from "src/scenes/grid-board/GridBoard";
import SVGParser from "src/scenes/svg-parser/SVGParser";

export const Scenes = {
  "Hello-World": HelloWorld,
  // "Count-Down": CountDown,
  Meteor: Meteor,
  Lightning: Lightning,
  Spotlight: Spotlight,
  Cap: Cap,
  "Multiplier-Text": MultiplierText,
  "Svg-Parser": SVGParser,
  "Grid-Board": GridBoard,
};

export type SceneName = keyof typeof Scenes;

export type SceneProps = {
  containerRef?: React.RefObject<HTMLDivElement>;
  isPixi?: boolean;
};
