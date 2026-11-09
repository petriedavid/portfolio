# David Petrie — Minimalist Portfolio & Three.js Physics Ball Pit

A pure, minimalist editorial portfolio and tactile 3D physics ball pit inspired directly by the design and interaction of **[shiyunlu.com](https://www.shiyunlu.com/)**.

Combines real downward gravity (`-Y`), screen-space frustum bounding walls and floor, tactile glossy boba pearls with soft studio contact shadows, an invisible kinematic mouse collider that plows through settled spheres, and an ultra-clean typography centerpiece with corner navigation drawer.

---

## ⚡ Architectural Design System

1. **Ultra-Minimalist Centerpiece Layout (`100dvh`, `overflow: hidden`)**:
   - **Display Typography**: Giant, high-impact uppercase name `DAVID PETRIE` with tight tracking (`-0.04em`) and understated lowercase title `systems & security engineer.`
   - **Quick Links**: `work`, `resume`, `email`, `linkedin`, and `github` sit directly under the title.
   - **Pointer-events transparency**: Header and centerpiece have `pointer-events: none` on layout wrappers, allowing the cursor to freely sweep and plow through the 3D balls anywhere across the screen.

2. **Full-Screen Menu**:
   - Minimalist `Menu` pill in the top-right corner that opens a full-screen overlay. It is wired up before Three.js loads, so it still works without WebGL. `/#work` opens it straight to the projects.
     - **00 // Profile**: Penn State ETI, Class of 2027; open to internships and full-time entry-level roles.
     - **01 // Contact**: Resume, `dvp5702@psu.edu`, LinkedIn, GitHub `/petriedavid`.
     - **02 // Selected Work**: `Ringlock`, `PixelLabz RPC`, and `NodeStop LLC`.
     - **03 // Education**: The Pennsylvania State University (B.S. in Enterprise Technology Integration).

3. **Tactile 3D Boba Physics Simulation (`js/physics-engine.js`)**:
   - **Physicality**: Real downward gravity (`gravity: -26.0`), snappy elastic sphere-to-sphere collisions with momentum exchange, and camera frustum floor & walls.
   - **Settling & Ball Pit Packing**: Ball size and count follow the viewport width (up to 56 balls) so the settled pile stays below the hero text. The simulation pauses while the menu is open and is skipped under `prefers-reduced-motion`.
   - **Name on the Floor**: `DAVID PETRIE` is drawn on a canvas texture and laid on the floor in front of the balls, on two lines on narrow screens. It is a soft decal, not a light-cast shadow, so it costs one draw call and stays readable.
   - **Studio Lighting & Contact Shadows**: Key and fill lights shape the highlights. A separate zero-intensity overhead light casts the shadows onto an invisible floor plane (`ShadowMaterial`), so they stay under the balls on both sides of the screen.
   - **Materials**: `MeshPhysicalMaterial` with clearcoat (`1.0`), low roughness (`0.12`), and graphite/chrome accents.
   - **Kinematic Mouse Collider**: The mouse cursor drives an invisible 3D kinematic sphere that plows through settled balls, imparting velocity based on cursor speed and trajectory.
   - **Click Impulses**: Clicking pops nearby balls upward with a spring impulse or drops a fresh batch of boba pearls from the ceiling.

4. **Resume**:
   - Keep the public copy at the repo root as `resume.pdf`. `/assets/` is cached as immutable for a year, so a replaced file there would stay stale for returning visitors.

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
