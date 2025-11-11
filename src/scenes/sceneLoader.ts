import { ComponentType, RefAttributes } from "react";
import HelloWorld from "src/scenes/hello-world/HelloWorld";
import CountDown from "src/scenes/count-down/CountDown";
import Meteor from "src/scenes/meteor/Meteor";

export interface SceneProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ThemeLoader: Record<
  string,
  ComponentType<SceneProps & RefAttributes<unknown>>
> = {
  "Hello World": HelloWorld,
  "Count Down": CountDown,
  Meteor: Meteor,
};

export type ThemeName = keyof typeof ThemeLoader;
