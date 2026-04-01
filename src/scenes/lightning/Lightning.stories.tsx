import type { Meta, StoryObj } from "@storybook/react-vite";
import { PixiSceneDecorator } from "../storybook-decorator";
import Lightning from "./Lightning";
import type {
  BorderBoltProps,
  TravelBoltProps,
  BoltDemoProps,
} from "./Lightning";
import "./GridOverlay.css";
import {
  borderBoltControls,
  travelBoltControls,
  lightningControls,
} from "./lightningControls";

// Flattened props with prefixes for Storybook (decorator transforms to hierarchical)
type LightningStoryProps = BorderBoltProps & {
  // Travel Bolt with prefix
  travel_boltCount: number;
  travel_displacement: number;
  travel_jaggedness: number;
  travel_branchProbability: number;
  travel_branchLength: number;
  travel_travelDuration: number;
  // Bolt Demo with prefix
  demo_boltAmount: number;
  demo_displacement: number;
  demo_jaggedness: number;
  demo_segmentPoints: number;
  demo_segmentDensity: number;
  demo_envelopeShape: number;
  demo_smoothingIterations: number;
  demo_lineWidth: number;
  demo_lineWidthVariation: number;
  demo_opacityVariation: number;
  demo_boltColor1: string;
  demo_boltColor2: string;
  demo_boltColor3: string;
  demo_glowDistance: number;
  demo_oscillationCycle: number;
  // Actions
  showBoltDemo?: boolean;
  regenerateTrigger?: boolean;
};

// Early deconstruct controls to reduce repetition
const {
  enableLightning: enableLightningCtrl,
  jaggedAmplitude: jaggedAmplitudeCtrl,
  jaggedFrequency1: jaggedFrequency1Ctrl,
  jaggedFrequency2: jaggedFrequency2Ctrl,
  jaggedFrequency3: jaggedFrequency3Ctrl,
  timeScale: timeScaleCtrl,
  randomness: randomnessCtrl,
  inset: insetCtrl,
  borderRadius: borderRadiusCtrl,
  lineWidth: borderLineWidthCtrl,
  branchProbability: borderBranchProbabilityCtrl,
  branchLength: borderBranchLengthCtrl,
  startDelay: startDelayCtrl,
  roundDuration: roundDurationCtrl,
  growthDuration: growthDurationCtrl,
} = borderBoltControls;

const {
  boltCount: boltCountCtrl,
  displacement: travelDisplacementCtrl,
  jaggedness: travelJaggednessCtrl,
  branchProbability: travelBranchProbabilityCtrl,
  branchLength: travelBranchLengthCtrl,
  travelDuration: travelDurationCtrl,
} = travelBoltControls;

const {
  boltAmount: boltAmountCtrl,
  displacement: demoDisplacementCtrl,
  jaggedness: demoJaggednessCtrl,
  segmentPoints: segmentPointsCtrl,
  segmentDensity: segmentDensityCtrl,
  envelopeShape: envelopeShapeCtrl,
  smoothingIterations: smoothingIterationsCtrl,
  lineWidth: demoLineWidthCtrl,
  lineWidthVariation: lineWidthVariationCtrl,
  opacityVariation: opacityVariationCtrl,
  boltColor1: boltColor1Ctrl,
  boltColor2: boltColor2Ctrl,
  boltColor3: boltColor3Ctrl,
  glowDistance: glowDistanceCtrl,
  oscillationCycle: oscillationCycleCtrl,
} = lightningControls;

const meta = {
  title: "Scenes/Lightning",
  component: Lightning,
  parameters: {
    layout: "fullscreen",
    controls: {
      expanded: false, // Collapse all control sections by default
    },
  },
  decorators: [
    PixiSceneDecorator,
    (Story, context) => {
      const { args } = context;

      // Transform flat prefixed args to hierarchical structure
      const borderBolt: BorderBoltProps = {
        enableLightning: args.enableLightning,
        jaggedAmplitude: args.jaggedAmplitude,
        jaggedFrequency1: args.jaggedFrequency1,
        jaggedFrequency2: args.jaggedFrequency2,
        jaggedFrequency3: args.jaggedFrequency3,
        timeScale: args.timeScale,
        randomness: args.randomness,
        inset: args.inset,
        borderRadius: args.borderRadius,
        lineWidth: args.lineWidth,
        branchProbability: args.branchProbability,
        branchLength: args.branchLength,
        startDelay: args.startDelay,
        roundDuration: args.roundDuration,
        growthDuration: args.growthDuration,
      };

      const travelBolt: TravelBoltProps = {
        boltCount: args.travel_boltCount,
        displacement: args.travel_displacement,
        jaggedness: args.travel_jaggedness,
        branchProbability: args.travel_branchProbability,
        branchLength: args.travel_branchLength,
        travelDuration: args.travel_travelDuration,
      };

      const boltDemo: BoltDemoProps = {
        boltAmount: args.demo_boltAmount,
        displacement: args.demo_displacement,
        jaggedness: args.demo_jaggedness,
        segmentPoints: args.demo_segmentPoints,
        segmentDensity: args.demo_segmentDensity,
        envelopeShape: args.demo_envelopeShape,
        smoothingIterations: args.demo_smoothingIterations,
        lineWidth: args.demo_lineWidth,
        lineWidthVariation: args.demo_lineWidthVariation,
        opacityVariation: args.demo_opacityVariation,
        boltColor1: args.demo_boltColor1,
        boltColor2: args.demo_boltColor2,
        boltColor3: args.demo_boltColor3,
        glowDistance: args.demo_glowDistance,
        oscillationCycle: args.demo_oscillationCycle,
      };

      return (
        /* eslint-disable @typescript-eslint/no-explicit-any */
        <Story
          args={
            {
              ...args,
              borderBolt,
              travelBolt,
              boltDemo,
            } as any
          }
        />
        /* eslint-enable @typescript-eslint/no-explicit-any */
      );
    },
  ],
  argTypes: {
    // Border Bolt controls
    enableLightning: {
      control: "boolean",
      description: enableLightningCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    jaggedAmplitude: {
      control: {
        type: "range",
        min: jaggedAmplitudeCtrl.min,
        max: jaggedAmplitudeCtrl.max,
        step: jaggedAmplitudeCtrl.step,
      },
      description: jaggedAmplitudeCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    jaggedFrequency1: {
      control: {
        type: "range",
        min: jaggedFrequency1Ctrl.min,
        max: jaggedFrequency1Ctrl.max,
        step: jaggedFrequency1Ctrl.step,
      },
      description: jaggedFrequency1Ctrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    jaggedFrequency2: {
      control: {
        type: "range",
        min: jaggedFrequency2Ctrl.min,
        max: jaggedFrequency2Ctrl.max,
        step: jaggedFrequency2Ctrl.step,
      },
      description: jaggedFrequency2Ctrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    jaggedFrequency3: {
      control: {
        type: "range",
        min: jaggedFrequency3Ctrl.min,
        max: jaggedFrequency3Ctrl.max,
        step: jaggedFrequency3Ctrl.step,
      },
      description: jaggedFrequency3Ctrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    timeScale: {
      control: {
        type: "range",
        min: timeScaleCtrl.min,
        max: timeScaleCtrl.max,
        step: timeScaleCtrl.step,
      },
      description: timeScaleCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    randomness: {
      control: {
        type: "range",
        min: randomnessCtrl.min,
        max: randomnessCtrl.max,
        step: randomnessCtrl.step,
      },
      description: randomnessCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    inset: {
      control: {
        type: "range",
        min: insetCtrl.min,
        max: insetCtrl.max,
        step: insetCtrl.step,
      },
      description: insetCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    borderRadius: {
      control: {
        type: "range",
        min: borderRadiusCtrl.min,
        max: borderRadiusCtrl.max,
        step: borderRadiusCtrl.step,
      },
      description: borderRadiusCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    lineWidth: {
      control: {
        type: "range",
        min: borderLineWidthCtrl.min,
        max: borderLineWidthCtrl.max,
        step: borderLineWidthCtrl.step,
      },
      description: borderLineWidthCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    branchProbability: {
      control: {
        type: "range",
        min: borderBranchProbabilityCtrl.min,
        max: borderBranchProbabilityCtrl.max,
        step: borderBranchProbabilityCtrl.step,
      },
      description: borderBranchProbabilityCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    branchLength: {
      control: {
        type: "range",
        min: borderBranchLengthCtrl.min,
        max: borderBranchLengthCtrl.max,
        step: borderBranchLengthCtrl.step,
      },
      description: borderBranchLengthCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    startDelay: {
      control: {
        type: "range",
        min: startDelayCtrl.min,
        max: startDelayCtrl.max,
        step: startDelayCtrl.step,
      },
      description: startDelayCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    roundDuration: {
      control: {
        type: "range",
        min: roundDurationCtrl.min,
        max: roundDurationCtrl.max,
        step: roundDurationCtrl.step,
      },
      description: roundDurationCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    growthDuration: {
      control: {
        type: "range",
        min: growthDurationCtrl.min,
        max: growthDurationCtrl.max,
        step: growthDurationCtrl.step,
      },
      description: growthDurationCtrl.label,
      table: {
        category: "Border Bolt",
      },
    },
    // Travel Bolt controls
    travel_boltCount: {
      control: {
        type: "range",
        min: boltCountCtrl.min,
        max: boltCountCtrl.max,
        step: boltCountCtrl.step,
      },
      description: boltCountCtrl.label,
      table: {
        category: "Travel Bolt",
      },
    },
    travel_displacement: {
      control: {
        type: "range",
        min: travelDisplacementCtrl.min,
        max: travelDisplacementCtrl.max,
        step: travelDisplacementCtrl.step,
      },
      description: travelDisplacementCtrl.label,
      table: {
        category: "Travel Bolt",
      },
    },
    travel_jaggedness: {
      control: {
        type: "range",
        min: travelJaggednessCtrl.min,
        max: travelJaggednessCtrl.max,
        step: travelJaggednessCtrl.step,
      },
      description: travelJaggednessCtrl.label,
      table: {
        category: "Travel Bolt",
      },
    },
    travel_branchProbability: {
      control: {
        type: "range",
        min: travelBranchProbabilityCtrl.min,
        max: travelBranchProbabilityCtrl.max,
        step: travelBranchProbabilityCtrl.step,
      },
      description: travelBranchProbabilityCtrl.label,
      table: {
        category: "Travel Bolt",
      },
    },
    travel_branchLength: {
      control: {
        type: "range",
        min: travelBranchLengthCtrl.min,
        max: travelBranchLengthCtrl.max,
        step: travelBranchLengthCtrl.step,
      },
      description: travelBranchLengthCtrl.label,
      table: {
        category: "Travel Bolt",
      },
    },
    travel_travelDuration: {
      control: {
        type: "range",
        min: travelDurationCtrl.min,
        max: travelDurationCtrl.max,
        step: travelDurationCtrl.step,
      },
      description: travelDurationCtrl.label,
      table: {
        category: "Travel Bolt",
      },
    },
    // Bolt Demo controls
    demo_boltAmount: {
      control: {
        type: "range",
        min: boltAmountCtrl.min,
        max: boltAmountCtrl.max,
        step: boltAmountCtrl.step,
      },
      description: boltAmountCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_displacement: {
      control: {
        type: "range",
        min: demoDisplacementCtrl.min,
        max: demoDisplacementCtrl.max,
        step: demoDisplacementCtrl.step,
      },
      description: demoDisplacementCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_jaggedness: {
      control: {
        type: "range",
        min: demoJaggednessCtrl.min,
        max: demoJaggednessCtrl.max,
        step: demoJaggednessCtrl.step,
      },
      description: demoJaggednessCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_segmentPoints: {
      control: {
        type: "range",
        min: segmentPointsCtrl.min,
        max: segmentPointsCtrl.max,
        step: segmentPointsCtrl.step,
      },
      description: segmentPointsCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_segmentDensity: {
      control: {
        type: "range",
        min: segmentDensityCtrl.min,
        max: segmentDensityCtrl.max,
        step: segmentDensityCtrl.step,
      },
      description: segmentDensityCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_envelopeShape: {
      control: {
        type: "range",
        min: envelopeShapeCtrl.min,
        max: envelopeShapeCtrl.max,
        step: envelopeShapeCtrl.step,
      },
      description: envelopeShapeCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_smoothingIterations: {
      control: {
        type: "range",
        min: smoothingIterationsCtrl.min,
        max: smoothingIterationsCtrl.max,
        step: smoothingIterationsCtrl.step,
      },
      description: smoothingIterationsCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_lineWidth: {
      control: {
        type: "range",
        min: demoLineWidthCtrl.min,
        max: demoLineWidthCtrl.max,
        step: demoLineWidthCtrl.step,
      },
      description: demoLineWidthCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_lineWidthVariation: {
      control: {
        type: "range",
        min: lineWidthVariationCtrl.min,
        max: lineWidthVariationCtrl.max,
        step: lineWidthVariationCtrl.step,
      },
      description: lineWidthVariationCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_opacityVariation: {
      control: {
        type: "range",
        min: opacityVariationCtrl.min,
        max: opacityVariationCtrl.max,
        step: opacityVariationCtrl.step,
      },
      description: opacityVariationCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_boltColor1: {
      control: "color",
      description: boltColor1Ctrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_boltColor2: {
      control: "color",
      description: boltColor2Ctrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_boltColor3: {
      control: "color",
      description: boltColor3Ctrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_glowDistance: {
      control: {
        type: "range",
        min: glowDistanceCtrl.min,
        max: glowDistanceCtrl.max,
        step: glowDistanceCtrl.step,
      },
      description: glowDistanceCtrl.label,
      table: {
        category: "Bolt Demo",
      },
    },
    demo_oscillationCycle: {
      control: {
        type: "range",
        min: oscillationCycleCtrl.min,
        max: oscillationCycleCtrl.max,
        step: oscillationCycleCtrl.step,
      },
      description: oscillationCycleCtrl.label,
      table: { category: "Bolt Demo" },
    },
    // Actions
    showBoltDemo: {
      control: "boolean",
      description: "Show/hide the bolt demo",
      table: {
        category: "Actions",
      },
    },
    regenerateTrigger: {
      control: "boolean",
      description: "Toggle to regenerate lightning bolts",
      table: {
        category: "Actions",
      },
    },
  },
} as Meta<LightningStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Border Bolt (no prefix), Travel Bolt (travel_ prefix), Bolt Demo (demo_ prefix)
    enableLightning: enableLightningCtrl.value,
    jaggedAmplitude: jaggedAmplitudeCtrl.value,
    jaggedFrequency1: jaggedFrequency1Ctrl.value,
    jaggedFrequency2: jaggedFrequency2Ctrl.value,
    jaggedFrequency3: jaggedFrequency3Ctrl.value,
    timeScale: timeScaleCtrl.value,
    randomness: randomnessCtrl.value,
    inset: insetCtrl.value,
    borderRadius: borderRadiusCtrl.value,
    lineWidth: borderLineWidthCtrl.value,
    branchProbability: borderBranchProbabilityCtrl.value,
    branchLength: borderBranchLengthCtrl.value,
    startDelay: startDelayCtrl.value,
    roundDuration: roundDurationCtrl.value,
    growthDuration: growthDurationCtrl.value,
    travel_boltCount: boltCountCtrl.value,
    travel_displacement: travelDisplacementCtrl.value,
    travel_jaggedness: travelJaggednessCtrl.value,
    travel_branchProbability: travelBranchProbabilityCtrl.value,
    travel_branchLength: travelBranchLengthCtrl.value,
    travel_travelDuration: travelDurationCtrl.value,
    demo_boltAmount: boltAmountCtrl.value,
    demo_displacement: demoDisplacementCtrl.value,
    demo_jaggedness: demoJaggednessCtrl.value,
    demo_segmentPoints: segmentPointsCtrl.value,
    demo_segmentDensity: segmentDensityCtrl.value,
    demo_envelopeShape: envelopeShapeCtrl.value,
    demo_smoothingIterations: smoothingIterationsCtrl.value,
    demo_lineWidth: demoLineWidthCtrl.value,
    demo_lineWidthVariation: lineWidthVariationCtrl.value,
    demo_opacityVariation: opacityVariationCtrl.value,
    demo_boltColor1: boltColor1Ctrl.value,
    demo_boltColor2: boltColor2Ctrl.value,
    demo_boltColor3: boltColor3Ctrl.value,
    demo_glowDistance: glowDistanceCtrl.value,
    demo_oscillationCycle: oscillationCycleCtrl.value,
    // Actions
    showBoltDemo: true,
    regenerateTrigger: true,
  },
};
