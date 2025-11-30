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
