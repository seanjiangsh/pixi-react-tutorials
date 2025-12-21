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
