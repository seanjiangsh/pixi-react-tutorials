import { ComponentType, RefAttributes } from "react";
import HelloWorld from "./hello-world/HelloWorld";
import CountDown from "./count-down/CountDown";

export interface SceneProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ThemeLoader: Record<
  string,
  ComponentType<SceneProps & RefAttributes<unknown>>
> = {
  "Hello World": HelloWorld,
  "Count Down": CountDown,
};

export type ThemeName = keyof typeof ThemeLoader;
