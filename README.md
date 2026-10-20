# David Petrie — Minimalist Portfolio & Three.js Physics Ball Pit

A pure, minimalist editorial portfolio and tactile 3D physics ball pit inspired directly by the design and interaction of **[shiyunlu.com](https://www.shiyunlu.com/)**.

Combines real downward gravity (`-Y`), screen-space frustum bounding walls and floor, tactile glossy boba pearls with soft studio contact shadows, an invisible kinematic mouse collider that plows through settled spheres, and an ultra-clean typography centerpiece with corner navigation drawer.

---

## ⚡ Architectural Design System

1. **Ultra-Minimalist Centerpiece Layout (`100dvh`, `overflow: hidden`)**:
   - **Display Typography**: Giant, high-impact uppercase name `DAVID PETRIE` with tight tracking (`-0.04em`) and understated lowercase title `systems & security engineer.`
   - **Pointer-events transparency**: Header and centerpiece have `pointer-events: none` on layout wrappers, allowing the cursor to freely sweep and plow through the 3D balls anywhere across the screen.

2. **Corner Navigation Drawer**:
   - Minimalist `Menu` pill in the top-right corner that slides out a clean editorial drawer for:
     - **00 // Profile & Focus**: Systems architecture, market microstructure, and high-throughput distributed networks.
     - **01 // Connect & Channels**: Direct contact links (`dvp5782@psu.edu`, LinkedIn `/in/gander`, GitHub `/petriedavid`).
     - **02 // Selected Work**: `sync // KXBTC15M` (Kalshi 15M Bitcoin Quantitative Architecture), `PixelLabz Global RPC Mesh` (Solana & Aptos Non-Consensus Mesh), `NodeStop Security Infrastructure` (InfoSec Threat Hunting).
     - **03 // Academic Foundation**: The Pennsylvania State University (B.S. in ETI & Cybersecurity).

3. **Tactile 3D Boba Physics Simulation (`js/physics-engine.js`)**:
   - **Physicality**: Real downward gravity (`gravity: -26.0`), snappy elastic sphere-to-sphere collisions with momentum exchange, and camera frustum floor & walls.
   - **Settling & Ball Pit Packing**: 50+ glossy boba pearls with variable radii settle naturally on the bottom floor like pearls in a glass box.
   - **Studio Lighting & Contact Shadows**: Studio key and fill lighting with soft directional shadow mapping onto an invisible floor plane (`ShadowMaterial`).
   - **Materials**: `MeshPhysicalMaterial` with clearcoat (`1.0`), low roughness (`0.12`), and graphite/chrome accents.
   - **Kinematic Mouse Collider**: The mouse cursor drives an invisible 3D kinematic sphere that plows through settled balls, imparting velocity based on cursor speed and trajectory.
   - **Click Impulses**: Clicking pops nearby balls upward with a spring impulse or drops a fresh batch of boba pearls from the ceiling.

4. **Subtle Inline Controls**:
   - **`// Camera`**: Smoothly toggles between frontal studio view and a tilted isometric perspective.
   - **`// Mouse`**: Toggles visibility of the kinematic mouse collider ring.
   - **`// Spheres`**: Triggers a waterfall cascade reset from the top of the viewport.

---

## 🚀 Local Development

```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.

---

## 🌐 Production Deployment

```bash
vercel --prod
```
