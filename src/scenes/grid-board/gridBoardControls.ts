export const gridBoardControls = {
  tiltEnabled: {
    value: true,
    label: "Enable Tilt",
  },
  tilt: {
    value: 0.5,
    min: 0,
    max: 2,
    step: 0.01,
    label: "Tilt Intensity",
  },
  pivot: {
    value: 1.0,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Pivot (0=top, 1=bottom)",
  },
  strokeWidth: {
    value: 1,
    min: 0.1,
    max: 10,
    step: 0.1,
    label: "Stroke Width",
  },
};

export const filterControls = {
  blur: {
    value: 0.1,
    min: 0,
    max: 5,
    step: 0.1,
    label: "Blur Strength",
  },
  blurOpacity: {
    value: 0.8,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Blur Layer Opacity",
  },
  glowDistance: {
    value: 1,
    min: 0,
    max: 5,
    step: 0.1,
    label: "Glow Distance",
  },
  glowOuterStrength: {
    value: 2,
    min: 0,
    max: 10,
    step: 0.1,
    label: "Glow Outer Strength",
  },
  glowInnerStrength: {
    value: 0,
    min: 0,
    max: 10,
    step: 0.1,
    label: "Glow Inner Strength",
  },
  glowQuality: {
    value: 0.5,
    min: 0.1,
    max: 1,
    step: 0.1,
    label: "Glow Quality",
  },
};
