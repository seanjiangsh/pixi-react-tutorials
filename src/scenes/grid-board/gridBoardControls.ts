export const gridBoardControls = {
  tilt: {
    value: 0,
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
  shiftX: {
    value: 0,
    min: -500,
    max: 500,
    step: 1,
    label: "Shift X",
  },
  shiftY: {
    value: 0,
    min: -500,
    max: 500,
    step: 1,
    label: "Shift Y",
  },
  scaleX: {
    value: 1,
    min: 0.1,
    max: 3,
    step: 0.01,
    label: "Scale X",
  },
  scaleY: {
    value: 1,
    min: 0.1,
    max: 3,
    step: 0.01,
    label: "Scale Y",
  },
  scaleAnchorX: {
    value: "left" as "left" | "right",
    options: ["left", "right"],
    label: "Scale Anchor X",
  },
  scaleAnchorY: {
    value: "bottom" as "top" | "bottom",
    options: ["top", "bottom"],
    label: "Scale Anchor Y",
  },
};

export const shadowControls = {
  shadowType: {
    value: "inner" as "inner" | "outer",
    options: ["inner", "outer"],
    label: "Shadow Type",
  },
  shadowGradientType: {
    value: "concentric" as "concentric" | "linear",
    options: ["linear", "concentric"],
    label: "Gradient Type",
  },
  shadowLineCount: {
    value: 5,
    min: 1,
    max: 20,
    step: 1,
    label: "Shadow Line Count",
  },
  shadowExtendDistance: {
    value: 8,
    min: 1,
    max: 30,
    step: 0.5,
    label: "Shadow Extend Distance",
  },
  shadowColorStart: {
    value: "#00ffff",
    label: "Shadow Color Start",
  },
  shadowColorEnd: {
    value: "#0088ff",
    label: "Shadow Color End",
  },
  shadowBlur: {
    value: 5,
    min: 0,
    max: 10,
    step: 0.1,
    label: "Shadow Blur Strength",
  },
  shadowOpacity: {
    value: 0.6,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Shadow Opacity",
  },
};
