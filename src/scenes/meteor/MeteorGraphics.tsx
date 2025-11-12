import { useMemo, useState, useCallback } from "react";
import { useTick } from "@pixi/react";

import { PointsBasedLayer } from "src/scenes/meteor/Layers";
import {
  calculateColor,
  generatePointsByEquation,
} from "src/scenes/meteor/meteorUtils";
import useSceneSize from "src/utils/useSceneSize";

// Meteor Graphics Component - draws meteor along points
type MeteorGraphicsProps = {
  width: number;
  baseBlur: number;
  layers?: number;
};

// Generate line points for a simple straight line
const linePoints = generatePointsByEquation({
  startPoint: { x: 0, y: 0 },
  equation: (t: number) => ({ x: -t, y: 0 }), // Horizontal line going left
  length: 800,
  segments: 10,
});

export function MeteorGraphics(props: MeteorGraphicsProps) {
  const { width, baseBlur, layers = 15 } = props;

  // Rotation state for animating the circle
  const [rotation, setRotation] = useState(0);

  // Animation function using useTick
  const animateRotation = useCallback(() => {
    setRotation((prev) => prev - 0.02); // Adjust speed as needed
  }, []);

  useTick(animateRotation);

  // Generate circle points with current rotation
  const circlePoints = useMemo(() => {
    return generatePointsByEquation({
      startPoint: { x: 0, y: 0 },
      equation: (t: number) => ({
        x: width * Math.cos(t + rotation),
        y: width * Math.sin(t + rotation),
      }),
      length: Math.PI,
      segments: 30,
    });
  }, [width, rotation]);

  const meteorLayers = useMemo(() => {
    const maxWidth = width * 0.5;
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
      const minLengthRatio = 0.5; // Minimum 50% length for outer layers
      const lengthRatio = minLengthRatio + progress * (1 - minLengthRatio);

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
          // points={linePoints}
          points={circlePoints}
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
