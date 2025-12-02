import { useState, useRef } from "react";
import { useControls, button } from "leva";
import { useTick } from "@pixi/react";
import { gsap } from "gsap";

import useSceneSize from "src/utils/hooks/useSceneSize";
import { CapGfx } from "src/scenes/cap/CapGfx";
import { capControls } from "src/scenes/cap/capControls";

// Short and long presets
const SHORT_PRESET = { D: 100, w: 100, m: 1.5, tRange: 3.5 };
const LONG_PRESET = { D: 100, w: 540, m: 14.5, tRange: 2.2 };

export function CapPixi() {
  const { width, height } = useSceneSize();
  const [longShortToggle, setLongShortToggle] = useState(0);
  const [depthToggle, setDepthToggle] = useState(0);

  const animationState = useRef({
    isAnimating: false,
    startTime: 0,
    startParams: { ...SHORT_PRESET },
    targetParams: { ...SHORT_PRESET },
    duration: 1000,
    isLong: false,
    lastToggleTrigger: 0,
  });

  const dAnimationState = useRef({
    isAnimating: false,
    startTime: 0,
    startD: 100,
    targetD: 100,
    duration: 1000,
    isZero: false,
    lastToggleTrigger: 0,
  });

  const lastControlValues = useRef({
    D: SHORT_PRESET.D,
    w: SHORT_PRESET.w,
    m: SHORT_PRESET.m,
    tRange: SHORT_PRESET.tRange,
  });

  const [controls, set] = useControls("Cap", () => ({
    D: { ...capControls.D, value: SHORT_PRESET.D },
    w: { ...capControls.w, value: SHORT_PRESET.w },
    m: { ...capControls.m, value: SHORT_PRESET.m },
    tRange: { ...capControls.tRange, value: SHORT_PRESET.tRange },
    color: capControls.color,
    "Toggle D 0/100": button(() => setDepthToggle((prev) => prev + 1)),
    "Toggle Short/Long": button(() => setLongShortToggle((prev) => prev + 1)),
  }));

  useTick(() => {
    const state = animationState.current;
    const dState = dAnimationState.current;

    // Check if toggle was triggered (only process once per trigger)
    if (longShortToggle !== state.lastToggleTrigger) {
      state.lastToggleTrigger = longShortToggle;
      const targetPreset = !state.isLong ? LONG_PRESET : SHORT_PRESET;
      state.isAnimating = true;
      state.startTime = performance.now();
      state.startParams = state.isLong ? LONG_PRESET : SHORT_PRESET; // Start from current preset
      state.targetParams = targetPreset;
      state.isLong = !state.isLong;
      return; // Skip rest of tick on first frame
    }

    // Check if D toggle was triggered
    if (depthToggle !== dState.lastToggleTrigger) {
      dState.lastToggleTrigger = depthToggle;
      const targetD = !dState.isZero ? 0 : 100;
      dState.isAnimating = true;
      dState.startTime = performance.now();
      dState.startD = controls.D; // Start from current D value
      dState.targetD = targetD;
      dState.isZero = !dState.isZero;
      return;
    }

    if (!state.isAnimating && !dState.isAnimating) {
      // Check if user manually changed controls while not animating
      const last = lastControlValues.current;
      if (
        controls.D !== last.D ||
        controls.w !== last.w ||
        controls.m !== last.m ||
        controls.tRange !== last.tRange
      ) {
        // Update last values
        last.D = controls.D;
        last.w = controls.w;
        last.m = controls.m;
        last.tRange = controls.tRange;
      }
      return;
    }

    // Handle D animation
    if (dState.isAnimating) {
      const elapsed = performance.now() - dState.startTime;
      const progress = Math.min(elapsed / dState.duration, 1);
      const easedProgress = gsap.parseEase("power2.inOut")(progress);
      const newD =
        dState.startD + (dState.targetD - dState.startD) * easedProgress;

      set({ D: newD });
      lastControlValues.current.D = newD;

      if (progress >= 1) {
        dState.isAnimating = false;
      }
    }

    // Handle preset animation
    if (state.isAnimating) {
      const elapsed = performance.now() - state.startTime;
      const progress = Math.min(elapsed / state.duration, 1);
      const easedProgress = gsap.parseEase("power2.inOut")(progress);

      const newParams = {
        D:
          state.startParams.D +
          (state.targetParams.D - state.startParams.D) * easedProgress,
        w:
          state.startParams.w +
          (state.targetParams.w - state.startParams.w) * easedProgress,
        m:
          state.startParams.m +
          (state.targetParams.m - state.startParams.m) * easedProgress,
        tRange:
          state.startParams.tRange +
          (state.targetParams.tRange - state.startParams.tRange) *
            easedProgress,
      };

      // Update Leva controls to reflect animated values
      set({
        D: newParams.D,
        w: newParams.w,
        m: newParams.m,
        tRange: newParams.tRange,
      });

      // Update last values
      lastControlValues.current = { ...newParams };

      if (progress >= 1) {
        state.isAnimating = false;
      }
    }
  });

  return (
    <pixiContainer x={width / 2} y={height / 2}>
      <CapGfx
        D={controls.D}
        w={controls.w}
        m={controls.m}
        tRange={controls.tRange}
        color={controls.color}
      />
    </pixiContainer>
  );
}
