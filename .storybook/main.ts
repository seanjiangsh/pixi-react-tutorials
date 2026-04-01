import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: "@storybook/react-vite",
  env: (config) => ({
    ...config,
    VITE_IN_STORYBOOK: "true",
  }),
  viteFinal: async (config) => {
    // Set base path for GitHub Pages deployment
    if (config.mode === "production") {
      config.base = "/pixi-react-tutorials/storybook/";
    }
    return config;
  },
};
export default config;
