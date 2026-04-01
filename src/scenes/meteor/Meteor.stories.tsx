import type { Meta, StoryObj } from "@storybook/react-vite";
import { PixiSceneDecorator } from "../storybook-decorator";
import Meteor from "./Meteor";
import { PathTypes } from "./MeteorGfx";

const meta = {
  title: "Scenes/Meteor",
  component: Meteor,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [PixiSceneDecorator],
  argTypes: {
    pathType: {
      control: "select",
      options: PathTypes,
      description: "Path type for the meteor animation",
    },
    startRatio: {
      control: { type: "range", min: 1.0, max: 2.0, step: 0.1 },
      description: "Start position ratio",
    },
    shrinkDuration: {
      control: { type: "range", min: 0.5, max: 5, step: 0.5 },
      description: "Duration of shrink animation in seconds",
    },
    baseBlur: {
      control: { type: "range", min: 0, max: 10, step: 1 },
      description: "Base blur amount",
    },
    layers: {
      control: { type: "range", min: 5, max: 20, step: 1 },
      description: "Number of layers",
    },
  },
} satisfies Meta<typeof Meteor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pathType: "rect",
    startRatio: 1.1,
    shrinkDuration: 2,
    baseBlur: 3,
    layers: 10,
  },
};
