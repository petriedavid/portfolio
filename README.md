# David Petrie // The Celestial Playground of Big Data

An interactive, whimsical **Celestial Playground** portfolio where big data and distributed systems come alive through playful fantasy metaphors, glowing neon hand-drawn doodles, and deep architectural rigor.

---

## 🪐 The Creative Concept: Metaphors of the Cosmos

Instead of scary cybersecurity terminal screens or strict finance charts, the portfolio explains complex technical disciplines through natural, celestial, and whimsical world-building:

- **Quantitative Finance → "Catching the Waves of Market Oceans"**:
  Not cold numbers, but sailing sturdy paper boats through the turbulent 15-minute Bitcoin tidal waves of prediction market order books (`sync // KXBTC15M`), using stars (Coinbase, Kraken, Bitstamp spot feeds) as navigational constellations.
- **Cybersecurity → "Magic Digital Castle Defense"**:
  Not sterile code, but building enchanted digital fortresses and weaving protective wards (Snort IDS, Wireshark, RSA-PSS cryptographic runes) that bounce away mischievous little pixel-ghost threats.
- **Distributed RPC Networks → "The Galactic Starlight Beacon Network"**:
  Not boring server clusters, but a 15-tower orbital beacon mesh across Ashburn, Frankfurt, and Singapore, beaming 8,000,000+ starlight packets at lightspeed with 0s landing time.
- **AI & Systems Architecture → "Organic Pattern-Weaving"**:
  An organic loom where threads of latency, synchronization, and active inference are woven into glowing celestial tapestry.

---

## ✨ Interactive Playful Features

1. **Interactive Cosmic Vortex Canvas**:
   - Real-time 2D HTML5 canvas featuring a swirling stardust vortex with gravitational mouse pull.
   - Periodic shooting stars and comets crossing the midnight sky.
   - Click anywhere to launch a burst of twinkling stardust sparkler confetti.
2. **Interactive Cosmo-Kitten Mascot ("space-cat")**:
   - A hand-drawn astronaut kitten floating in a starlight helmet. Click the cat to receive quirky quotes ("Purr-ing at 1,000 RPS! 🐾✨", "Sipping cosmic milk in the Azure cloud! 🥛🪐").
3. **Floating Paper Boat & Wave Animations**:
   - An animated origami paper boat bobbing on glowing multi-layer sine waves, braving the 60-second settlement tidal wave.
4. **Mischievous Pixel-Ghosts & Magic Castle Shield**:
   - Floating pixel-ghost cyber-threats that bounce off the castle's shimmering translucent ward bubble on hover with a cute "boop! blocked! 👻🛡️".
5. **Celestial Systems Grimoire (Lightbox Modal)**:
   - 3-tab technical inspector revealing full-resolution vessel screenshots, end-to-end data planes, and complete component latency specifications.

---

## 🏛️ Verified Systems & Engineering Specifications

### 1. sync // KXBTC15M
*Institutional Kalshi 15-Minute Bitcoin Binary Quantitative Trading & Telemetry Architecture*
- **Closed-Form Microstructure:** Synthetic BRTI Lead-Lag Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage.
- **Live Performance:**
  - **Live Win Rate / Profit Factor:** `81.8%` // `2.14 PF` (15,000 backtest segments)
  - **Realized Session PnL:** `+$110.52 USD` (Live Kalshi markets)
  - **Gateway Latency:** `11ms End-to-End`
  - **Cosmic Star-Clock Drift:** Azure Hyper-V Hardware PTP `/dev/ptp0` `<5μs`
- **Stack:** Python 3.11, FastAPI (100ms Telemetry), React 18, TypeScript, TimescaleDB, Azure Linux (SR-IOV <15μs), RSA-PSS Signatures, Quarter-Kelly Sizing.

### 2. PixelLabz Global RPC Mesh
*High-Throughput Non-Consensus Node Mesh on Solana & Aptos*
- Co-architected non-consensus RPC network on Solana and Aptos across 15+ bare-metal servers in U.S., Germany, and Singapore.
- Sustained 1,000 RPS per node with 0s landing time (same-block transaction inclusion) and Yellowstone gRPC streaming.
- Validated across 8M+ live transactions; generated ~$180,000 in platform revenue; 4,000+ active users; 99.99% service uptime.

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
