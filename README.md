# David Petrie — Editorial Portfolio & Three.js Physics Canvas

A minimalist, high-contrast editorial portfolio inspired by the interaction and visual aesthetic of **[shiyunlu.com](https://www.shiyunlu.com/)**.

Combines an interactive 3D Verlet physics simulation running at 60 FPS in Three.js with an editorial typography layer (`Geist` & `Geist Mono`), live physics telemetry, collapsible Technical HUD debug controls, and verified institutional systems architecture case studies.

---

## ⚡ Architectural Design System

1. **Layered Full-Viewport Architecture (`100dvh`)**:
   - **Background Substrate (`z-index: 1`)**: Full-screen Three.js WebGL physics canvas.
   - **Foreground Editorial Layer (`z-index: 10`)**: High-contrast typography with `pointer-events: none` on structural wrappers and `pointer-events: auto` on interactive elements, allowing cursor interactions and drag gestures to pass directly to the physics canvas while keeping content clickable.

2. **Interactive 3D Sphere Physics Engine (`js/physics-engine.js`)**:
   - Zero-dependency, lightweight Verlet collision integration solver.
   - Camera frustum boundary math with real-time viewport reflection.
   - 3D Raycaster cursor force field:
     - **Repel**: Spheres scatter dynamically away from the cursor.
     - **Attract**: Spheres cluster smoothly toward the cursor.
     - **Vortex**: Spheres orbit cyclonically around the cursor.
   - Radial impulse shockwaves on mouse click.
   - 3D sphere grabbing, dragging, and throwing with velocity inheritance.
   - Subtle camera parallax reacting to cursor movement.

3. **Technical HUD / Debug Controls Overlay (Shiyun Lu Style)**:
   - Docked in the lower-right corner with monospaced typography (`Geist Mono`).
   - Live controls:
     - **`// Spheres`**: Dynamic count switching (16 / 30 / 48), Gravity presets (0G, 1G, -1G, Vortex), Restitution elasticity slider (0.40 – 0.98), Materials (Obsidian, Chrome, Studio).
     - **`// Mouse`**: Force mode toggling (Repel / Attract / Vortex), Force radius slider (3.0 – 12.0).
     - **`// Camera`**: Mouse parallax toggle.
     - **`// Telemetry`**: Live FPS performance monitor (`requestAnimationFrame` delta tracking) and Verlet 3D engine status.
     - **Scene Actions**: Instant `SCATTER` impulse and clean `RESET` layout.

4. **Preserved Real-World Systems & Engineering Specifications**:
   - **`sync // KXBTC15M`**: Institutional Kalshi 15-Minute Bitcoin Binary Quantitative Trading Engine (81.8% Win Rate, 2.14 Profit Factor, 11ms Gateway Latency, Azure Hyper-V Hardware PTP `<5μs`, RSA-PSS, Quarter-Kelly).
   - **`PixelLabz Global RPC Mesh`**: High-Throughput Non-Consensus Node Mesh on Solana & Aptos (8M+ transactions, 1,000 RPS/node, 0s same-block landing, $180k+ revenue, 99.99% uptime).
   - **`NodeStop Enterprise Security Infrastructure`**: Information Security Analyst Intern (Snort IDS, Wireshark packet inspection, Nmap, Nessus, Hydra, penetration testing).
   - **`Academic Foundation`**: The Pennsylvania State University, B.S. in Enterprise Technology Integration & Cybersecurity Operations & Analytics (GPA: 3.4, Expected May 2027).

---

## 🚀 Local Development

To run locally using any standard static server:

```bash
# Python 3 built-in HTTP server
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.

---

## 🌐 Production Deployment

The project is configured for static zero-friction deployment to Vercel:

```bash
vercel --prod
```
