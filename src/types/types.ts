import { Color } from "pixi.js";
export type Point2D = { x: number; y: number };

// Common color and alpha type
export type ColorAlpha = {
  color: number | string | Color;
  alpha: number;
};
