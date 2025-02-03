export type ThemeName = keyof typeof ThemeLoader;

export const ThemeLoader = {
  "Hello World": () => import("./hello-world/HelloWorld"),
  // Add more scenes here
};
