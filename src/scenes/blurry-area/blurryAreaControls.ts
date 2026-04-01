export const blurryAreaControls = {
  areaMargin: {
    value: 0.1,
    min: 0.05,
    max: 0.25,
    step: 0.01,
    label: "Area Margin",
  },
  blurStrength: {
    value: 20,
    min: 0,
    max: 50,
    step: 1,
    label: "Blur Strength",
  },
  shapeSize: {
    value: 0.08,
    min: 0.04,
    max: 0.15,
    step: 0.01,
    label: "Shape Size",
  },
  edgeThreshold: {
    value: 100,
    min: 20,
    max: 200,
    step: 10,
    label: "Edge Blur Distance",
  },
};
