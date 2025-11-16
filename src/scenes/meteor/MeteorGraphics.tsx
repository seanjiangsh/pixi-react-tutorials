import { useMemo, useState, useCallback } from "react";
import { extend, useTick } from "@pixi/react";
import { Container } from "pixi.js";

import { PointsBasedLayer, PathFillLayer } from "src/scenes/meteor/Layers";
import {
  calculateColor,
  generateCirclePath,
  generateRoundedRectPath,
} from "src/scenes/meteor/meteorUtils";

extend({ Container });

// Meteor Graphics Component - draws meteor along points
type MeteorGraphicsProps = {
  width: number;
  height: number;
  startRatio?: number;
  baseBlur: number;
  layers?: number;
  pathType?: "rect" | "circle";
};

export function MeteorGraphics(props: MeteorGraphicsProps) {
  const { width, height, startRatio = 1.3 } = props;
  const { baseBlur, layers = 15, pathType = "rect" } = props;

  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  const startWidth = maxDimension * startRatio;
  const targetWidth = minDimension;

  // Animated width that shrinks from startWidth to targetWidth over 3 seconds
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animation for shrinking effect (runs once on mount)
  const animateShrink = useCallback(() => {
    if (animationProgress >= 1) return;

    setAnimationProgress((prev) => {
      const newProgress = Math.min(prev + 1 / (60 * 3), 1);
      return newProgress;
    });
  }, [animationProgress]);

  useTick(animationProgress < 1 ? animateShrink : () => {});

  // Calculate width based on animation progress (ease-out cubic)
  const progressWidth = useMemo(() => {
    const t = animationProgress;
    const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
    return startWidth + (targetWidth - startWidth) * eased;
  }, [animationProgress, startWidth, targetWidth]);

  // Animation offset (0 to 1, representing position along the path)
  const [offset, setOffset] = useState(0);

  // Animation function for path traversal (starts immediately)
  const animateOffset = useCallback(() => {
    setOffset((prev) => (prev - 0.005 + 1) % 1); // Counter-clockwise: decrement and loop
  }, []);

  useTick(animateOffset);

  // Generate the FULL circle path once (memoized by width only)
  const circleFullPath = useMemo(() => {
    return generateCirclePath({
      radius: progressWidth * 0.4,
      segments: 100,
    });
  }, [progressWidth]);

  // Generate the FULL rounded rectangle path with animated shrinking
  const roundedRectFullPath = useMemo(() => {
    const margin = 64;

    // Animate rect dimensions during shrink (start larger, end at screen size with margin)
    const t = animationProgress;
    const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out

    const startRectWidth = width * startRatio;
    const startRectHeight = height * startRatio;
    const targetRectWidth = width - margin * 2;
    const targetRectHeight = height - margin * 2;

    const rectWidth =
      startRectWidth + (targetRectWidth - startRectWidth) * eased;
    const rectHeight =
      startRectHeight + (targetRectHeight - startRectHeight) * eased;
    const radius = 32;

    return generateRoundedRectPath({
      width: rectWidth,
      height: rectHeight,
      radius,
      segments: 500,
    });
  }, [animationProgress, width, startRatio, height]);

  // Use path based on pathType prop
  const fullPath = pathType === "circle" ? circleFullPath : roundedRectFullPath;

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
      const minWidth = maxWidth * 0.03;
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
    <pixiContainer x={width / 2} y={height / 2} alpha={animationProgress}>
      {/* Dim brownish-gray fill for the path area */}
      <PathFillLayer
        points={fullPath}
        fill={{
          color: "#3d3228", // Dim brownish-gray
          alpha: 0.35,
        }}
        border={{
          color: "#6a5a48", // Brighter brownish-gray
          alpha: 0.6,
          width: 2,
          blur: 3, // Blur to blend in more
        }}
      />
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
    </pixiContainer>
  );
}
