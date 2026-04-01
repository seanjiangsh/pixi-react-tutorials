import { useState, useRef, useEffect, useMemo } from "react";
import { useControls, button } from "leva";
import { useTick } from "@pixi/react";
import { gsap } from "gsap";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { MultiplierTextGfx } from "src/scenes/multiplier-text/MultiplierTextGfx";
import { multiplierTextControls } from "src/scenes/multiplier-text/multiplierTextControls";

export function MultiplierTextPixi() {
  const { width, height } = useSceneSize();

  // Calculate grid cell size (matching the pattern from GridOverlay)
  const cellSize = useMemo(() => {
    const isHorizontal = width > height;
    if (isHorizontal) {
      const gridWidth = width * 0.6;
      const targetCellSize = 80;
      const cols = Math.max(1, Math.floor(gridWidth / targetCellSize));
      return gridWidth / cols;
    } else {
      const gridHeight = height * 0.8;
      const targetCellSize = 80;
      const rows = Math.max(1, Math.floor(gridHeight / targetCellSize));
      return gridHeight / rows;
    }
  }, [width, height]);

  const [currentValue, setCurrentValue] = useState(1);
  const [opacity, setOpacity] = useState(0);
  const [playTrigger, setPlayTrigger] = useState(0);

  // Calculate font size based on grid cell size
  const fontSize = useMemo(() => {
    // Make font size about 30% of cell size to fit nicely
    return Math.floor(cellSize * 0.3);
  }, [cellSize]);

  const animationState = useRef({
    isPlaying: false,
    startTime: 0,
  });

  const [controls] = useControls("Controls.Multiplier Text", () => ({
    targetValue: {
      ...multiplierTextControls.targetValue,
    },
    animationDuration: {
      ...multiplierTextControls.animationDuration,
    },
    textColor: {
      ...multiplierTextControls.textColor,
    },
    animationEffect: {
      ...multiplierTextControls.animationEffect,
    },
    "Play Animation": button(() => setPlayTrigger((prev) => prev + 1)),
  }));

  const { targetValue, animationDuration, textColor, animationEffect } =
    controls;

  // Handle play trigger
  useEffect(() => {
    if (playTrigger > 0) {
      // Reset state
      setCurrentValue(1);
      setOpacity(0);
      animationState.current = {
        isPlaying: true,
        startTime: Date.now(),
      };
    }
  }, [playTrigger]);

  // Animation tick - fade-in and counting happen simultaneously
  useTick(() => {
    const state = animationState.current;
    if (!state.isPlaying) return;

    const now = Date.now();
    const elapsed = (now - state.startTime) / 1000;
    const progress = Math.min(elapsed / animationDuration, 1);

    // Update opacity (fade-in)
    setOpacity(Math.min(progress * 1.2, 1)); // Slightly faster fade-in

    // Update counting with GSAP easing
    const easedProgress = gsap.parseEase("power2.out")(progress);
    const newValue = 1 + (targetValue - 1) * easedProgress;
    setCurrentValue(newValue);

    // Complete animation
    if (progress >= 1) {
      state.isPlaying = false;
      setCurrentValue(targetValue);
      setOpacity(1);
    }
  });

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlayTrigger(1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MultiplierTextGfx
      x={width / 2}
      y={height / 2}
      currentValue={currentValue}
      opacity={opacity}
      fontSize={fontSize}
      textColor={textColor}
      effect={animationEffect}
      cellSize={cellSize}
    />
  );
}
