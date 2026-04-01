// Debug controls
export const debugControls = {
  showDimming: {
    value: true,
    label: "Show Dimming",
  },
  showBoard: {
    value: true,
    label: "Show Board",
  },
  dimmingOpacity: {
    value: 0.75,
    min: 0,
    max: 1,
    step: 0.05,
    label: "Dimming Opacity",
  },
};

// Spotlight controls
export const spotlightControls = {
  spotlightCount: {
    value: 1,
    min: 1,
    max: 5,
    step: 1,
    label: "Spotlight Count",
  },
  spotlightRadius: {
    value: 80,
    min: 50,
    max: 200,
    step: 5,
    label: "Spotlight Radius",
  },
  maxSpeed: {
    value: 100,
    min: 50,
    max: 300,
    step: 10,
    label: "Max Speed",
  },
  acceleration: {
    value: 50,
    min: 10,
    max: 200,
    step: 10,
    label: "Acceleration",
  },
  friction: {
    value: 0.95,
    min: 0.8,
    max: 0.99,
    step: 0.01,
    label: "Friction",
  },
  glowStrength: {
    value: 10,
    min: 0,
    max: 30,
    step: 1,
    label: "Glow Strength",
  },
};

// Animation controls
export const animationControls = {
  autoAdvance: {
    value: true,
    label: "Auto Advance Phases",
  },
  expandDuration: {
    value: 0.8,
    min: 0.3,
    max: 2.0,
    step: 0.1,
    label: "Expand Duration (s)",
  },
  expandPause: {
    value: 0.3,
    min: 0,
    max: 1.0,
    step: 0.1,
    label: "Pause Before Expand (s)",
  },
  velocityWeight: {
    value: 50,
    min: 0,
    max: 200,
    step: 10,
    label: "Velocity Awareness Weight",
  },
};

export type DebugProps = {
  showDimming: boolean;
  showBoard: boolean;
  dimmingOpacity: number;
};

export type SpotlightProps = {
  spotlightCount: number;
  spotlightRadius: number;
  maxSpeed: number;
  acceleration: number;
  friction: number;
  glowStrength: number;
};

export type AnimationProps = {
  autoAdvance: boolean;
  expandDuration: number;
  expandPause: number;
  velocityWeight: number;
};
