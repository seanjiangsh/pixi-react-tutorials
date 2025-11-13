import { useMemo, useState, useCallback, useEffect } from "react";
import { useTick } from "@pixi/react";

import { PointsBasedLayer } from "src/scenes/meteor/Layers";
import {
  calculateColor,
  generatePointsByEquation,
} from "src/scenes/meteor/meteorUtils";

// Meteor Graphics Component - draws meteor along points
type MeteorGraphicsProps = {
  width: number;
  baseBlur: number;
  layers?: number;
};

export function MeteorGraphics(props: MeteorGraphicsProps) {
  const { width, baseBlur, layers = 15 } = props;

  // Rotation state for animating the circle
  const [rotation, setRotation] = useState(0);

  // // Animation function using useTick
  // const animateRotation = useCallback(() => {
  //   setRotation((prev) => prev - 0.02); // Adjust speed as needed
  // }, []);

  // useTick(animateRotation);

  const circlePoints = useMemo(() => {
    return generatePointsByEquation({
      origin: { x: 0, y: 0 },
      equation: (t: number) => ({
        x: width * Math.cos(t + rotation),
        y: width * Math.sin(t + rotation),
      }),
      tStart: 0,
      tEnd: Math.PI * 2,
      segments: 30,
    });
  }, [width, rotation]);

  // Animation offset (0 to 1, representing position along the path)
  const [offset, setOffset] = useState(0);

  // Animation function using useTick
  const animateOffset = useCallback(() => {
    setOffset((prev) => (prev - 0.005 + 1) % 1); // Counter-clockwise: decrement and loop
  }, []);

  useTick(animateOffset);

  // Generate the FULL rounded square path once (memoized by width only)
  const fullPath = useMemo(() => {
    const size = width * 0.8; // Square size
    const radius = width * 0.1; // Corner radius
    const halfSize = size / 2;

    // Calculate segment lengths
    const straightLength = 2 * (halfSize - radius); // Full side minus both corner radii
    const arcLength = (Math.PI / 2) * radius;
    const sideLength = straightLength + arcLength;
    const totalLength = sideLength * 4;

    return generatePointsByEquation({
      origin: { x: 0, y: 0 },
      equation: (t: number) => {
        // Clamp t to valid range to avoid modulo issues at boundaries
        t = Math.max(0, Math.min(t, totalLength - 0.0001));

        // Determine which segment (0-3) and position within segment
        const segmentIndex = Math.floor(t / sideLength);
        const segmentT = t - segmentIndex * sideLength;

        let x = 0,
          y = 0;

        if (segmentIndex === 0) {
          // Segment 0: Bottom side (right to left) + bottom-left corner
          if (segmentT <= straightLength) {
            // Straight part: from (halfSize - radius, halfSize) to (-halfSize + radius, halfSize)
            x = halfSize - radius - segmentT;
            y = halfSize;
          } else {
            // Arc part: bottom-left corner (center at -halfSize + radius, halfSize - radius)
            const arcProgress = (segmentT - straightLength) / arcLength;
            const angle = Math.PI / 2 + arcProgress * (Math.PI / 2); // 90° to 180° (counter-clockwise)
            x = -halfSize + radius + radius * Math.cos(angle);
            y = halfSize - radius + radius * Math.sin(angle);
          }
        } else if (segmentIndex === 1) {
          // Segment 1: Left side (bottom to top) + top-left corner
          if (segmentT <= straightLength) {
            // Straight part: from (-halfSize, halfSize - radius) to (-halfSize, -halfSize + radius)
            x = -halfSize;
            y = halfSize - radius - segmentT;
          } else {
            // Arc part: top-left corner (center at -halfSize + radius, -halfSize + radius)
            const arcProgress = (segmentT - straightLength) / arcLength;
            const angle = Math.PI + arcProgress * (Math.PI / 2); // 180° to 270° (counter-clockwise)
            x = -halfSize + radius + radius * Math.cos(angle);
            y = -halfSize + radius + radius * Math.sin(angle);
          }
        } else if (segmentIndex === 2) {
          // Segment 2: Top side (left to right) + top-right corner
          if (segmentT <= straightLength) {
            // Straight part: from (-halfSize + radius, -halfSize) to (halfSize - radius, -halfSize)
            x = -halfSize + radius + segmentT;
            y = -halfSize;
          } else {
            // Arc part: top-right corner (center at halfSize - radius, -halfSize + radius)
            const arcProgress = (segmentT - straightLength) / arcLength;
            const angle = (3 * Math.PI) / 2 + arcProgress * (Math.PI / 2); // 270° to 0° (counter-clockwise)
            x = halfSize - radius + radius * Math.cos(angle);
            y = -halfSize + radius + radius * Math.sin(angle);
          }
        } else {
          // Segment 3: Right side (top to bottom) + bottom-right corner
          if (segmentT <= straightLength) {
            // Straight part: from (halfSize, -halfSize + radius) to (halfSize, halfSize - radius)
            x = halfSize;
            y = -halfSize + radius + segmentT;
          } else {
            // Arc part: bottom-right corner (center at halfSize - radius, halfSize - radius)
            const arcProgress = (segmentT - straightLength) / arcLength;
            const angle = arcProgress * (Math.PI / 2); // 0° to 90° (counter-clockwise)
            x = halfSize - radius + radius * Math.cos(angle);
            y = halfSize - radius + radius * Math.sin(angle);
          }
        }

        return { x, y };
      },
      tStart: 0,
      tEnd: totalLength,
      segments: 200,
      includeTangents: true,
    });
  }, [width]);

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
          // points={circlePoints}
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
