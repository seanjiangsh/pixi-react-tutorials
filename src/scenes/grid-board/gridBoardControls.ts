export const gridBoardControls = {
  tiltEnabled: {
    value: true,
    label: "Enable Tilt",
  },
  tilt: {
    value: 0.0,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Tilt (0-1)",
  },
  depth: {
    value: 120,
    min: -300,
    max: 300,
    step: 1,
    label: "Depth",
  },
  // Direct matrix parameters
  sy: {
    value: 0.6,
    min: 0,
    max: 2,
    step: 0.01,
    label: "Scale Y (vertical squash)",
  },
  skewX: {
    value: 0.6,
    min: -2,
    max: 2,
    step: 0.01,
    label: "Skew X (horizontal shear)",
  },
  py: {
    value: 120,
    min: -300,
    max: 300,
    step: 1,
    label: "Translate Y (push back)",
  },
  useDirectMatrix: {
    value: false,
    label: "Use Direct Matrix Params",
  },
  strokeWidth: {
    value: 1,
    min: 0.1,
    max: 10,
    step: 0.1,
    label: "Stroke Width",
  },
};
