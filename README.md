# Pixi.js React Tutorials

A collection of interactive visual effects and animations built with **Pixi.js** and **React**, demonstrating the integration of WebGL-powered graphics in modern web applications.

## 🎨 Features

- **Multiple Interactive Scenes**: Switch between different visual demonstrations including:

  - **Hello World**: Interactive sprite animation with pointer tracking and blur effects
  - **Meteor**: Dynamic particle system with customizable path following, blur layers, and GSAP animations
  - **Lightning**: Advanced lightning bolt effects with border animation, travel bolts, and procedural generation

- **Storybook Integration**: Interactive component documentation with full control customization

- **Advanced Graphics Utilities**:

  - Path generation for circles and rounded rectangles
  - Custom equation-based point generation
  - Multi-layer blur effects with Kawase filters
  - HSL-based color transitions for smooth visual effects

- **Responsive Design**: Automatically adapts to viewport size changes, including mobile virtual keyboard detection

- **Developer Controls**: Interactive Leva controls for real-time parameter adjustments (blur strength, animation speed, layer count, etc.)

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Pixi.js 8** for high-performance 2D WebGL rendering
- **@pixi/react** for declarative Pixi.js components
- **GSAP** for advanced animations and easing
- **pixi-filters** for visual effects
- **Vite** for fast development and building
- **Leva** for GUI controls
- **Storybook 10** for component documentation and testing
- **Zustand** for state management

## 🌐 Demo

- **[Live Demo](https://seanjiangsh.github.io/pixi-react-tutorials)** - Main application
- **[Storybook](https://seanjiangsh.github.io/pixi-react-tutorials/storybook)** - Interactive component documentation

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Storybook
npm run sb

# Build for production
npm run build

# Build both app and Storybook, deploy to GitHub Pages
npm run deploy
```

## 📦 Project Structure

```
src/
├── components/      # UI components (Header, Scene, SceneButtonList)
├── scenes/          # Individual scene implementations
├── utils/
│   ├── graphics/   # Graphics utilities (path generation, drawing helpers)
│   └── hooks/      # Custom React hooks (viewport, scene size)
└── types/          # TypeScript type definitions
```

## 🎯 Use Cases

This project serves as a reference for:

- Integrating Pixi.js with React applications
- Creating performant WebGL animations
- Building reusable graphics utilities
- Implementing parametric curve rendering
- Managing complex visual effects with multiple layers
- Setting up Storybook with Pixi.js components
- Separating development and production control interfaces (Leva vs Storybook)
