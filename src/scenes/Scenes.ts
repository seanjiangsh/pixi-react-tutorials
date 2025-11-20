import HelloWorld from "src/scenes/hello-world/HelloWorld";
import CountDown from "src/scenes/count-down/CountDown";
import Meteor from "src/scenes/meteor/Meteor";
import Lightning from "src/scenes/lightning/Lightning";

export interface SceneProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const Scenes = {
  "Hello World": HelloWorld,
  // "Count Down": CountDown,
  Meteor: Meteor,
  Lightning: Lightning,
};

export type SceneName = keyof typeof Scenes;
