# David Petrie // Liquid Glass Dark-Mode Resume

An ultra-modern, high-end **Liquid Glass** digital resume and portfolio inspired by **Apple visionOS, Linear, and Raycast**.

---

## 🫧 Liquid Glass Aesthetic Architecture

1. **Obsidian Charcoal Foundation**:
   - Deep, rich obsidian charcoal (`#0B0B0F`), avoiding flat pitch-black to create atmospheric depth.
2. **Slow-Moving Ambient Light Orbs**:
   - Softly blurred ambient light orbs in **electric mint green** (`#00FFC2`) and **deep indigo** (`#6366F1` / `#4F46E5`) floating dynamically in the background with unhurried 24–32s organic float animations.
3. **Viscous Mouse Cursor Light Trail**:
   - A subtle ambient spotlight with viscous inertial damping (`lerp: 0.085`) that smoothly trails behind the cursor. As you move around the page, the light **shines and refracts directly through the frosted glass panels** (`backdrop-filter: blur(28px) saturate(190%)`).
4. **Frosted Translucent VisionOS Panels**:
   - Translucent obsidian glass surfaces (`rgba(18, 18, 26, 0.62)`) with 1px translucent borders (`rgba(255, 255, 255, 0.08)`), top specular rim highlights, and ambient shadow depth.

---

## 🚀 Featured Engineering Projects

### 1. sync // KXBTC15M
*Institutional Kalshi 15-Minute Bitcoin Binary Quantitative Trading & Telemetry Architecture*
- **Mandate:** Closed-form microstructure pricing: Synthetic BRTI Lead-Lag Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage for Kalshi prediction markets (`KXBTC15M`).
- **Audit Performance:** 15,000-segment quantitative backtest audit:
  - **Win Rate:** `92.09%` (3,678 / 3,994)
  - **Sharpe Ratio:** `11.42` (Sortino: `5.12`)
  - **Max Drawdown:** `0.46%` ($96.25 USD)
  - **Hardware Clock Drift:** Azure Hyper-V Hardware PTP `/dev/ptp0` `<5μs`
- **Stack:** Python 3.11, FastAPI (100ms Telemetry), React 18, TimescaleDB, Azure Linux (SR-IOV), RSA-PSS Signatures, Quarter-Kelly Risk Sizing.
- **Image Slot:** Dedicated `16:9` visual frame at `assets/screenshots/lattice-preview.svg` with a drop-in slot for terminal captures once a picture is taken.

### 2. PixelLabz Global RPC Mesh
*High-Throughput Non-Consensus Node Mesh on Solana & Aptos*
- Co-architected non-consensus RPC network on Solana and Aptos across 15+ bare-metal servers in U.S., Germany, and Singapore.
- Validated across 8M+ live transactions; generated ~$180,000 in revenue; 4,000+ active users; 99.99% service uptime.

---

## 💼 Work Experience

- **PixelLabz / PixelPilotz RPC** (Co-Founder & Director of Community Relations | Apr 2022 — Present)
- **NodeStop LLC** (Information Security Analyst, Jr. Intern | Jan 2023 — Present)

---

## 🎓 Academic Foundation

- **The Pennsylvania State University** — University Park, PA
- B.S. in Enterprise Technology Integration / Cybersecurity Operations & Analytics (GPA: 3.4, Expected May 2027)

---

## 🚀 Running Locally

```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.
