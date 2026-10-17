# David Petrie // Minimalist Liquid Glass Portfolio

An ultra-modern, high-end **Liquid Glass** interactive portfolio designed with optical physical realism, architectural glass beveling, visionOS specular refraction, and WebGL fluid caustics.

---

## 💎 Design System & Aesthetic Architecture

1. **Pure Monochromatic Minimalism**:
   - Deep Obsidian base canvas (`#08090C`), avoiding flat pitch black or muddy blur overlays.
   - Variable alpha frosted glass substrates (`rgba(255, 255, 255, 0.03)` to `0.08`) with multi-stop inner borders (`inset 0 1px 1px rgba(255, 255, 255, 0.22)`) replicating physical glass beveling.
   - Adaptive background blur: `backdrop-filter: blur(28px) saturate(180%)`.
2. **The Liquid Glass Canvas (Hero Layer & Background)**:
   - Full-viewport WebGL fluid background rendering real-time optical caustics, simplex noise waves, and chromatic aberration (prismatic RGB split on wave peaks).
   - Inertial optical mercury spotlight trailing the cursor with smooth damping and automatic idle throttling (0% CPU when stationary).
3. **The Floating Prism Project Dock**:
   - Suspended glass crystalline panels with 3D perspective tilt (`perspective(1200px) rotateX(...) rotateY(...)`) reactive to mouse position.
   - On hover, ambient light concentrates along the bevel edge with shifting specular rim light, while the high-resolution interface preview emerges smoothly from beneath the frosted surface.
4. **Discipline Filters (The Liquid Toggle)**:
   - Floating glass toggle bar with a smooth liquid highlight slider that physically stretches, snaps, and filters project categories (ALL, QUANT & MICROSTRUCTURE, DISTRIBUTED RPC, CYBER DEFENSE, CORE SYSTEMS).
5. **Interactive Project Overlay ("The Magnifying Glass")**:
   - Seamless elastic zoom expansion into edge-to-edge minimalist case study overlay with full telemetry matrices, hardware invariants, and data plane routing pipelines.

---

## 🏛️ Verified Systems & Engineering Specifications

### 1. sync // KXBTC15M
*Institutional Kalshi 15-Minute Bitcoin Binary Quantitative Trading & Telemetry Architecture*
- **Closed-Form Microstructure:** Synthetic BRTI Lead-Lag Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage.
- **Live Performance:**
  - **Live Win Rate / Profit Factor:** `81.8%` // `2.14 PF` (15,000 backtest segments)
  - **Realized Session PnL:** `+$110.52 USD` (Live Kalshi markets)
  - **Gateway Latency:** `11ms End-to-End`
  - **Hardware Clock Drift:** Azure Hyper-V Hardware PTP `/dev/ptp0` `<5μs`
- **Stack:** Python 3.11, FastAPI (100ms Telemetry), React 18, TypeScript, TimescaleDB, Azure Linux (SR-IOV <15μs), RSA-PSS Signatures, Quarter-Kelly Sizing.

### 2. PixelLabz Global RPC Mesh
*High-Throughput Non-Consensus Node Mesh on Solana & Aptos*
- Co-architected non-consensus RPC network on Solana and Aptos across 15+ bare-metal servers in U.S., Germany, and Singapore.
- Sustained 1,000 RPS per node with 0s landing time (same-block transaction inclusion) and Yellowstone gRPC streaming.
- Validated across 8M+ live transactions; generated ~$180,000 in platform revenue; 4,000+ active users; 99.99% service uptime.

### 3. NodeStop Enterprise Security Infrastructure
*Information Security Analyst Intern — Threat Hunting & Deep Packet Telemetry*
- Real-time network traffic analysis and raw packet inspection with Snort IDS and Wireshark.
- Penetration testing and credential fuzzing exercises with Nmap, Nessus, Hydra, Medusa.

---

## 🎓 Academic Foundation

- **The Pennsylvania State University** — University Park, PA
- B.S. in Enterprise Technology Integration & Cybersecurity Operations & Analytics (GPA: 3.4, Expected May 2027)

---

## 🛠️ Running Locally & Deployment

```bash
# Run local HTTP server
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.

Deploy directly to Vercel:
```bash
vercel --prod
```
