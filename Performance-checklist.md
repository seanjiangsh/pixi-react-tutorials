# ✅ **Pixi.js Performance Checklist (For Designers & Animators)**

### **A. Avoid (High Cost)**

- ⛔ **Animated blur, glow, drop shadows**
- ⛔ **Large moving gradients (shader or vector-based)**
- ⛔ **Animating Pixi.Graphics shapes every frame**
- ⛔ **Moving or complex vector masks**
- ⛔ **Repeated full-screen effects**
- ⛔ **Sprites ≥ 2000px that animate or blur**
- ⛔ **Multiple blend modes in same animated group**
- ⛔ **Over 1000 animated objects without ParticleContainer**

---

### **B. Use With Caution (Medium Cost)**

- ⚠️ Animated mesh with many vertices
- ⚠️ ColorMatrixFilter animations
- ⚠️ Alpha masks on large images
- ⚠️ Gradients that change stops or angle
- ⚠️ Shadows cast via shader
- ⚠️ Animating polygon/path with >100 points
- ⚠️ Rebuilding text every frame

---

### **C. Safe (Low Cost)**

- ✅ Moving, scaling, rotating sprites
- ✅ Changing alpha
- ✅ Tinting sprites
- ✅ Using pre-rendered PNG glows/shadows
- ✅ Spritesheet animations
- ✅ Scrolling UV textures
- ✅ Mesh deformation with <20 vertices
- ✅ Masking static shapes
- ✅ ParticleContainer for particle effects

---

# 📊 **Pixi.js Animation Cost Table**

| Feature / Technique                     | Cost     | Animation Impact | Recommended?           | Notes                            |
| --------------------------------------- | -------- | ---------------- | ---------------------- | -------------------------------- |
| **Blur / Glow / DropShadow (animated)** | 🔥🔥🔥🔥 | Very bad         | ❌ Avoid               | Largest FPS drop on all devices  |
| **Blur / Glow / Shadow (static)**       | 🔥🔥     | Medium           | ⚠️ Use small area only | Pre-render instead when possible |
| **Animating Pixi.Graphics**             | 🔥🔥🔥   | Bad              | ❌ Avoid               | Redraw = rebuild geometry        |
| **Gradient with shader (animated)**     | 🔥🔥🔥   | Bad              | ❌ Avoid               | Per-pixel cost high              |
| **Gradient as static texture**          | 🔥       | Low              | ✔ Safe                 | Pre-render from Figma/Photoshop  |
| **Moving vector mask**                  | 🔥🔥🔥   | Bad              | ❌ Avoid               | Causes extra framebuffer passes  |
| **Static vector mask**                  | 🔥🔥     | Medium           | ⚠️                     | Small masks okay                 |
| **Sprite masks**                        | 🔥       | Low              | ✔ Mostly safe          | Best mask choice                 |
| **Huge sprites (full-screen)**          | 🔥🔥     | Medium           | ⚠️                     | Large fill-rate cost             |
| **Multiple blend modes**                | 🔥🔥     | Medium           | ⚠️                     | Causes batch breaks              |
| **Spritesheet animation**               | 😊       | Low              | ✔ Best option          | GPU-friendly                     |
| **UV scrolling textures**               | 😊       | Low              | ✔ Very fast            | Zero geometry cost               |
| **Position / Scale / Rotation**         | 😊       | Very low         | ✔✔ Safe                | Cheapest animation               |
| **Tint change**                         | 😊       | Very low         | ✔✔ Safe                | Uniform change only              |
| **Mesh animation (<20 vertices)**       | 😊       | Low              | ✔ Good                 | Avoid large meshes               |
| **ParticleContainer**                   | 😊       | Very low         | ✔ Best for particles   | Hardware-accelerated batching    |

---

# 🧮 Computational Cost of Common Math Operations (for Graphics)

When designing equations for animations or procedural graphics (Pixi.js, shaders, particle systems), the **computational cost** of each math operation matters.
Some operations are extremely fast, while others are noticeably expensive when evaluated thousands of times per frame.

Below is a cost ranking you can use when deciding which math form to use.

---

## **Cost Ranking of Operations (Cheap → Expensive)**

In general graphics pipelines (Pixi.js, JS, GLSL-like thinking):

$$
\text{addition/subtraction } (+,-)
\;<\;
\text{multiplication } (\times)
\;<\;
\text{division } (/)
\;<\;
\sqrt{x}
\;<\;
x^m
\;<\;
e^x
$$

---

## **Operation Cost Table**

| Operation      | Example       | Relative Cost               | Notes                     |
| -------------- | ------------- | --------------------------- | ------------------------- |
| Add / Subtract | $a + b$       | 😊 (very cheap)             | Fastest operations        |
| Multiply       | $a \cdot b$   | 😊 (very cheap)             | Nearly same as add        |
| Divide         | $\frac{a}{b}$ | 🔥🔥                        | Slightly slower           |
| Square Root    | $\sqrt{x}$    | 🔥🔥🔥                      | More work than divide     |
| Power          | $x^m$         | 🔥🔥🔥🔥                    | Cheaper if $m$ is integer |
| Exponential    | $e^x$         | 🔥🔥🔥🔥🔥 (most expensive) | Always slowest            |

---

## **Why This Matters (Pixi / Animation / Realtime)**

If your graphic or animation evaluates an equation like

$$
y = e^{-x^2}
$$

for **1,000 points per frame**, at **60 FPS**, that's **60,000 exponential evaluations** per second — costly.

A cheaper approximation might be:

$$
y = \frac{1}{1+x^2}
$$

Same general bell shape, but with only:

- multiplication
- division
- addition

→ **extremely fast**.

---

## **Rule of Thumb for Pixi.js**

Use this principle:

> **If many points require the same function each frame → avoid `e^x` and non-integer powers.**

Prefer:

- $x^2$
- $x^3$
- $\frac{1}{1+x^2}$
- polynomial or rational functions

Avoid:

- $e^x$
- $\ln x$
- $x^{0.73}$ (non-integer powers)
- nested power/exponential expressions

---
