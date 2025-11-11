import { useMemo } from "react";
import { MeteorShapeLayer } from "src/scenes/meteor/Layers";
import { calculateColor } from "src/scenes/meteor/meteorUtils";

// Unified Meteor Graphics Component (combines head semicircle + tail triangle)
type MeteorGraphicsProps = {
  radius: number;
  baseBlur: number;
  layers?: number;
};

export function MeteorGraphics(props: MeteorGraphicsProps) {
  const { radius, baseBlur, layers = 15 } = props;

  const meteorLayers = useMemo(() => {
    const maxRadius = radius * 0.625;
    const maxTailLength = radius * 32;
    const result: Array<{
      circleRadius: number;
      tailLength: number;
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

      // Circle radius for head semicircle
      const minRadius = maxRadius * 0.05; // 5% minimum
      const circleRadius = minRadius + maxRadius * sizeMultiplier;

      // Tail length
      const minTailLength = maxTailLength * 0.4;
      const tailLength = minTailLength + maxTailLength * sizeMultiplier;

      // Color and brightness
      const brightness = 0.4 + progress * 0.6; // Dimmer at outer, brighter at inner
      const { color, alpha } = calculateColor(brightness);

      // Quadratic blur: decreases quadratically from outer (progress=0) to inner (progress=1)
      // Using inverseProgress^2 so blur is strong at outer layers, weak at inner
      const blurStrength = Math.pow(inverseProgress, 2) * 16 * baseBlur;

      // console.log({ i, blurStrength });
      result.push({
        circleRadius,
        tailLength,
        color,
        alpha,
        blurStrength,
      });
    }

    return result;
  }, [radius, baseBlur, layers]);

  return (
    <>
      {meteorLayers.map((layer, index) => (
        <MeteorShapeLayer
          key={index}
          circleRadius={layer.circleRadius}
          tailLength={layer.tailLength}
          color={layer.color}
          alpha={layer.alpha}
          blurStrength={layer.blurStrength}
        />
      ))}
    </>
  );
}
