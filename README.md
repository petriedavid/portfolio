# David Petrie // Systems Architecture & Quantitative Infrastructure

An ultra-modern, high-performance **Liquid Glass** digital portfolio and systems resume inspired by **Apple visionOS, Linear, and Vercel Geist**.

---

## 🏛️ Systems Architecture & Invariants

1. **Kernel Bypass & Hardware Clock Synchronization**:
   - Virtualized network interface routing via **Azure SR-IOV** (`<15μs` packet latency), lock-free Single-Producer Single-Consumer (SPSC) ring buffers, and **IEEE 1588 PTP hardware clock synchronization** (`/dev/ptp0` drift `<5μs`).
2. **Multi-Region Distributed RPC Mesh**:
   - Geographically dispersed bare-metal node architecture across **Ashburn (US-East), Frankfurt (EU-Central), and Singapore (APAC)**, sustaining **1,000 RPS per node** with Yellowstone & Geyser gRPC real-time streaming.
3. **Deterministic Quantitative Microstructure**:
   - Purpose-built execution engine for Kalshi `KXBTC15M` prediction markets. Replaces curve-fit heuristics with **Synthetic CME CF BRTI Lead-Lag Replication** across Coinbase, Kraken, and Bitstamp with 60-second settlement TWAP pinning arbitrage and Quarter-Kelly risk sizing.
4. **Cryptographic Auditing & Active Inference Defense**:
   - Cryptographically verifiable trade journaling with **append-only SHA-256 hash chains** and RSA-PSS signatures in TimescaleDB, paired with raw packet inspection using **Snort IDS** and active inference anomaly detection models.

---

## 🫧 Visual Architecture & Scrolling Reveal

- **Obsidian Liquid Glass Foundation**: Deep obsidian charcoal (`#060709`) and translucent glass cards (`rgba(16, 18, 24, 0.64)`) with top specular highlights and refractive shadow depths.
- **Scrolling Reveal**: Smooth `IntersectionObserver` reveal animations with subtle blur-up and translation dynamics, micro-staggering child metrics, and full `prefers-reduced-motion` compliance.
- **Viscous Cursor Spotlight**: Inertial damping (`lerp: 0.085`) trailing behind the cursor with automatic idle throttling (0% CPU when stationary).
- **Interactive Systems Inspector**: 3-tab modal inspector displaying real-time system interface screenshots, end-to-end data-flow topologies, and complete hardware/system invariant specification tables.

---

## 🚀 Verified Systems & Engineering Projects

### 1. sync // KXBTC15M
*Institutional Kalshi 15-Minute Bitcoin Binary Quantitative Trading & Telemetry Architecture*
- **Mandate:** Closed-form microstructure pricing: Synthetic BRTI Lead-Lag Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage.
- **Performance:**
  - **Live Win Rate / Profit Factor:** `81.8%` // `2.14 PF`
  - **Realized Session PnL:** `+$110.52 USD`
  - **Gateway Latency:** `11ms End-to-End`
  - **Clock Drift:** Azure Hyper-V Hardware PTP `/dev/ptp0` `<5μs`
- **Stack:** Python 3.11, FastAPI (100ms Telemetry), React 18, TypeScript, TimescaleDB, Azure Linux (SR-IOV), RSA-PSS Signatures, Quarter-Kelly Sizing.

### 2. PixelLabz Global RPC Mesh
*High-Throughput Non-Consensus Node Mesh on Solana & Aptos*
- Co-architected non-consensus RPC network on Solana and Aptos across 15+ bare-metal servers in U.S., Germany, and Singapore.
- Sustained 1,000 RPS per node with 0s landing time (same-block transaction inclusion) and Yellowstone gRPC streaming.
- Validated across 8M+ live transactions; generated ~$180,000 in platform revenue; 4,000+ active users; 99.99% service uptime.

---

## 💼 Systems Track Record

- **PixelLabz / PixelPilotz RPC** (Co-Founder & Infrastructure Lead | Apr 2022 — March 2025 // Ashburn, VA)
- **NodeStop LLC** (Information Security Analyst Intern | Jan 2023 — March 2024 // Remote)

---

## 🎓 Academic Foundation

- **The Pennsylvania State University** — University Park, PA
- B.S. in Enterprise Technology Integration & Cybersecurity Operations & Analytics (GPA: 3.4, Expected May 2027)
- Coursework: Systems Architecture, Distributed Systems & Blockchain, Operating Systems Principles, AI & Machine Learning, Cyber Threat Analytics, Network Security, Database Management.

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
