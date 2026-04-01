export const multiplierTextControls = {
  targetValue: {
    value: 200,
    min: 10,
    max: 999,
    step: 10,
    label: "Target Value",
    options: [50, 100, 200, 500, 999],
  },
  animationDuration: {
    value: 2,
    min: 0.5,
    max: 5,
    step: 0.1,
    label: "Animation Duration (s)",
  },
  textColor: {
    value: "#FFD700",
    label: "Text Color",
  },
  animationEffect: {
    value: "Smooth Count",
    label: "Animation Effect",
    options: ["Smooth Count", "Sprint Scale (TBD)", "Pulse Dim (TBD)"],
  },
};
