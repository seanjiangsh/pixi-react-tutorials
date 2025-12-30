export const capControls = {
  D: {
    value: 100,
    min: 0,
    max: 300,
    step: 10,
    label: "Depth (D)",
  },
  w: {
    value: 100,
    min: 50,
    max: 1000,
    step: 10,
    label: "Width (w)",
  },
  m: {
    value: 2,
    min: 1,
    max: 50,
    step: 0.5,
    label: "Steepness (m)",
  },
  tRange: {
    value: 2.5,
    min: 1,
    max: 10,
    step: 0.1,
    label: "Range Multiplier (t)",
  },
};

export const capFillControls = {
  gradientColor1: {
    value: "#1a3a2a",
    label: "Gradient Color 1",
  },
  gradientColor2: {
    value: "#0d1f15",
    label: "Gradient Color 2",
  },
};

export const capFilterControls = {
  blurAmount: {
    value: 0,
    min: 0,
    max: 20,
    step: 0.5,
    label: "Blur Amount",
  },
};

export const capStrokeControls = {
  strokeMode: {
    value: "gradient",
    options: ["color", "gradient"],
    label: "Stroke Mode",
  },
  strokeColor: {
    value: "#2ecc71",
    label: "Stroke Color",
    render: (get: any) => get("strokeMode") === "color",
  },
  strokeGradientColor1: {
    value: "#f6f6f6ff",
    label: "Stroke Gradient Color 1",
    render: (get: any) => get("strokeMode") === "gradient",
  },
  strokeGradientColor2: {
    value: "#0021f5ff",
    label: "Stroke Gradient Color 2",
    render: (get: any) => get("strokeMode") === "gradient",
  },
};
