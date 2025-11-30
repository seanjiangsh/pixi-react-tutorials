import type { Meta, StoryObj } from "@storybook/react-vite";
import { PixiSceneDecorator } from "../storybook-decorator";
import HelloWorld from "./HelloWorld";

const meta = {
  title: "Scenes/HelloWorld",
  component: HelloWorld,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [PixiSceneDecorator],
} satisfies Meta<typeof HelloWorld>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
