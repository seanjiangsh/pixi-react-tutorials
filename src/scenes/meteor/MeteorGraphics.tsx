import { useMemo, useState, useCallback } from "react";
import { useTick } from "@pixi/react";

import { PointsBasedLayer } from "src/scenes/meteor/Layers";
import {
  calculateColor,
  generateCirclePath,
  generateRoundedSquarePath,
} from "src/scenes/meteor/meteorUtils";

// Meteor Graphics Component - draws meteor along points
type MeteorGraphicsProps = {
  width: number;
  baseBlur: number;
  layers?: number;
};

export function MeteorGraphics(props: MeteorGraphicsProps) {
  const { width, baseBlur, layers = 15 } = props;

  // Animation offset (0 to 1, representing position along the path)
  const [offset, setOffset] = useState(0);

  // Animation function using useTick
  const animateOffset = useCallback(() => {
    setOffset((prev) => (prev - 0.005 + 1) % 1); // Counter-clockwise: decrement and loop
  }, []);

  useTick(animateOffset);

  // Generate the FULL circle path once (memoized by width only)
  const circleFullPath = useMemo(() => {
    return generateCirclePath({
      radius: width * 0.4,
      segments: 100,
    });
  }, [width]);

  // Generate the FULL rounded square path once (memoized by width only)
  const roundedSquareFullPath = useMemo(() => {
    const size = width * 0.8; // Square size
    const radius = width * 0.1; // Corner radius

    return generateRoundedSquarePath({
      size,
      radius,
      segments: 200,
    });
  }, [width]);

  // Use rounded square path for rendering (swap with circleFullPath to use circle)
  // const fullPath = circleFullPath;
  const fullPath = roundedSquareFullPath;

  // Extract a section of the path based on current offset
  const visibleRatio = 0.25;
  const visiblePath = useMemo(() => {
    const startIndex = Math.floor(offset * fullPath.length);
    const pathSection: typeof fullPath = [];

    // Get a continuous section, wrapping around if needed
    for (let i = 0; i < fullPath.length * visibleRatio; i++) {
      const index = (startIndex + i) % fullPath.length;
      pathSection.push(fullPath[index]);
    }

    return pathSection;
  }, [fullPath, offset]);

  const meteorLayers = useMemo(() => {
    const maxWidth = Math.min(width * 0.5, 80);
    const result: Array<{
      width: number;
      lengthRatio: number;
      color: number;
      alpha: number;
      blurStrength: number;
    }> = [];

    // Draw from outer to inner (i from 0 to layers-1)
    for (let i = 0; i < layers; i++) {
      const progress = i / (layers - 1); // 0 at outer, 1 at inner
      const inverseProgress = 1 - progress; // 1 at outer, 0 at inner

      // Exponential growth: very small at center, rapidly grows outward
      const sizeMultiplier = Math.pow(inverseProgress, 3);

      // Width for the meteor
      const minWidth = maxWidth * 0.01; // 1% minimum
      const width = minWidth + maxWidth * sizeMultiplier;

      // Length ratio: outer layers are shorter, inner layers are longer
      const minLengthRatio = 0.15; // Minimum 15% length for outer layers
      // const maxLengthRatio = 0.35; // Maximum 35% length for inner layers
      const maxLengthRatio = 1; // Maximum 35% length for inner layers
      const lengthRatio =
        minLengthRatio + progress * (maxLengthRatio - minLengthRatio);

      // Color and brightness
      const brightness = 0.4 + progress * 0.6; // Dimmer at outer, brighter at inner
      const { color, alpha } = calculateColor(brightness);

      // Quadratic blur: decreases quadratically from outer (progress=0) to inner (progress=1)
      const blurStrength = Math.pow(inverseProgress, 2) * 16 * baseBlur;

      result.push({
        width,
        lengthRatio,
        color,
        alpha,
        blurStrength,
      });
    }

    return result;
  }, [baseBlur, layers, width]);

  return (
    <>
      {meteorLayers.map((layer, index) => (
        <PointsBasedLayer
          key={index}
          points={visiblePath}
          width={layer.width}
          lengthRatio={layer.lengthRatio}
          color={layer.color}
          alpha={layer.alpha}
          blurStrength={layer.blurStrength}
        />
      ))}
    </>
  );
}
