import HelloWorld from "src/scenes/hello-world/HelloWorld";
import CountDown from "src/scenes/count-down/CountDown";
import Meteor from "src/scenes/meteor/Meteor";
import Lightning from "src/scenes/lightning/Lightning";
import Spotlight from "src/scenes/spotlight/Spotlight";

export const Scenes = {
  "Hello World": HelloWorld,
  // "Count Down": CountDown,
  Meteor: Meteor,
  Lightning: Lightning,
  Spotlight: Spotlight,
};

export type SceneName = keyof typeof Scenes;

export type SceneProps = {
  containerRef?: React.RefObject<HTMLDivElement>;
  isPixi?: boolean;
};
