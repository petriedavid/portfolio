/**
 * THE CELESTIAL PLAYGROUND OF BIG DATA // INTERACTIVE CONTROLLER
 * Features:
 * - Real-time HTML5 2D Cosmic Vortex Canvas with gravitational mouse swirl and shooting stars
 * - Interactive Cosmo-Kitten mascot with whimsical quotes & stardust hearts
 * - Bouncing pixel-ghosts & interactive paper boat waves
 * - Smooth scroll reveal & dynamic orbit navigation tracker
 * - Celestial Systems Grimoire / Lightbox Modal with 3 technical tabs
 * - Accurate Eastern Time star-clock
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================================================
  // 1. Interactive Cosmic Vortex Canvas (Gravitational Particle Swirl)
  // =========================================================================
  const canvas = document.getElementById('cosmic-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let isMouseOver = false;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseOver = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      isMouseOver = false;
    });

    // Particle pool
    const PARTICLE_COUNT = Math.min(180, Math.floor(window.innerWidth / 8));
    const particles = [];
    const colors = ['#00F0FF', '#B388FF', '#FFD54F', '#00FFA3', '#FF6090', '#FFFFFF'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseAngle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        orbitRadius: Math.random() * 260 + 40,
        alpha: Math.random() * 0.7 + 0.2
      });
    }

    // Interactive Sparkler bursts on click
    const sparklers = [];
    window.addEventListener('click', (e) => {
      // Don't trigger if clicked on a button or link
      if (e.target.closest('button, a, input')) return;
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        sparklers.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    });

    // Periodic Shooting Stars / Comets
    const shootingStars = [];
    function spawnShootingStar() {
      if (Math.random() < 0.015 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.3,
          length: Math.random() * 80 + 50,
          speed: Math.random() * 9 + 7,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          life: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    let animId = null;
    function renderVortex() {
      ctx.clearRect(0, 0, width, height);

      // Render cosmic particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cosmic gravitational vortex around mouse
        if (isMouseOver) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 320 && dist > 15) {
            const force = (320 - dist) / 320 * 0.04;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            // Swirl tangentially
            p.vx += (-dy / dist) * force * 0.8;
            p.vy += (dx / dist) * force * 0.8;
          }
        }

        // Apply friction to avoid runaway speeds
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      // Render sparkler particles
      for (let i = sparklers.length - 1; i >= 0; i--) {
        const s = sparklers[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) {
          sparklers.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // Render Shooting Stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, star.color);
        grad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.globalAlpha = star.life;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.life -= 0.02;

        if (star.life <= 0 || star.x > width || star.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(renderVortex);
    }

    renderVortex();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(renderVortex);
      }
    });
  }

  // =========================================================================
  // 2. Interactive Cosmo-Kitten Mascot ("space-cat")
  // =========================================================================
  const spaceCat = document.getElementById('space-cat');
  const catBubble = document.getElementById('cat-bubble');
  const catQuotes = [
    'Purr-ing at 1,000 RPS! 🐾✨',
    'Sipping cosmic milk in the Azure cloud! 🥛🪐',
    'Zero dropped packets under my watch! ⚡',
    'Bouncing pixel-ghosts off the perimeter! 🛡️👻',
    'Paper boat riding the 15m Bitcoin wave! ⛵🌊',
    'PTP star-clock drift: strictly <5μs! ⏳',
    'Meow! Welcome to the Celestial Playground! 🌟'
  ];
  let quoteIdx = 0;

  if (spaceCat && catBubble) {
    spaceCat.addEventListener('click', () => {
      quoteIdx = (quoteIdx + 1) % catQuotes.length;
      catBubble.textContent = catQuotes[quoteIdx];
      catBubble.style.transform = 'rotate(-4deg) scale(1.15)';
      catBubble.style.borderColor = 'var(--neon-gold)';
      catBubble.style.color = 'var(--neon-gold)';

      setTimeout(() => {
        catBubble.style.transform = 'rotate(4deg) scale(1)';
        catBubble.style.borderColor = 'var(--neon-pink)';
        catBubble.style.color = 'var(--text-hand-pink)';
      }, 350);
    });
  }

  // =========================================================================
  // 3. Interactive Paper Boat Rocking Splash
  // =========================================================================
  const paperBoat = document.getElementById('paper-boat');
  if (paperBoat) {
    paperBoat.addEventListener('click', () => {
      paperBoat.style.transform = 'scale(1.25) rotate(15deg)';
      setTimeout(() => {
        paperBoat.style.transform = '';
      }, 400);
    });
  }

  // =========================================================================
  // 4. Scrolling Reveal System (IntersectionObserver)
  // =========================================================================
  const revealItems = document.querySelectorAll('.reveal-item');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach((el) => revealObserver.observe(el));
  }

  // =========================================================================
  // 5. Active Orbit Navigation Tracker
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  const orbitLinks = document.querySelectorAll('.orbit-link');

  function updateActiveOrbit() {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach((sec) => {
      if (scrollPos >= sec.offsetTop) {
        currentId = sec.getAttribute('id');
      }
    });

    orbitLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', updateActiveOrbit, { passive: true });
  updateActiveOrbit();

  // =========================================================================
  // 6. Celestial Systems Grimoire / Lightbox Modal
  // =========================================================================
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxTabs = document.querySelectorAll('.lightbox-tab');
  const tabPanels = {
    preview: document.getElementById('lightbox-tab-preview'),
    architecture: document.getElementById('lightbox-tab-architecture'),
    invariants: document.getElementById('lightbox-tab-invariants')
  };
  const lightboxMedia = document.getElementById('lightbox-media');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxArchDetails = document.getElementById('lightbox-arch-details');
  const lightboxInvariantsDetails = document.getElementById('lightbox-invariants-details');

  const celestialGrimoire = {
    sync: {
      title: 'sync // KXBTC15M — Quantitative Microstructure & Wave-Riding Spellbook',
      image: 'assets/screenshots/sync.png',
      desc: 'Deterministic market-microstructure trading bot and telemetry dashboard purpose-built for Kalshi KXBTC15M prediction markets. Employs Synthetic BRTI Lead-Lag Constellation Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage, sub-millisecond execution routing, and SHA-256 tamper-evident cryptographic trade logging.',
      topologyHtml: `
        <div style="background-color: rgba(6, 4, 18, 0.75); border: 1px dashed var(--neon-cyan); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-family: var(--font-mono); font-size: 10.5px; color: var(--neon-cyan); font-weight: 700;">WAVE-RIDER DATA PLANE &amp; PIPELINE FLOW</span>
            <span style="font-family: var(--font-hand); font-size: 15px; color: var(--neon-gold);">"Sub-15μs ingress · 11ms exchange RTT ⚡"</span>
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-cyan);">01 // INGRESS</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">Spot Venues</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">Coinbase · Kraken · Bitstamp</span>
            </div>
            <div style="color: var(--neon-gold); align-self: center;">──▶</div>
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-cyan);">02 // KERNEL BYPASS</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">Azure SR-IOV</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">Lock-Free SPSC Ring Buffer</span>
            </div>
            <div style="color: var(--neon-gold); align-self: center;">──▶</div>
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-cyan);">03 // ARBITRAGE CORE</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">BRTI Lead-Lag</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">60s TWAP Pinning</span>
            </div>
            <div style="color: var(--neon-gold); align-self: center;">──▶</div>
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-cyan);">04 // GATEWAY</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">Kalshi Dispatch</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">Sub-ms Order Route</span>
            </div>
            <div style="color: var(--neon-gold); align-self: center;">──▶</div>
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-cyan);">05 // AUDITING</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">SHA-256 WAL</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">TimescaleDB Chain</span>
            </div>
          </div>
        </div>

        <p class="lightbox-desc">
          <strong>Vessel Architecture:</strong> Consumes raw Level-2 and Level-3 WebSocket streams directly from spot liquidity venues through an Azure SR-IOV virtualized NIC (&lt;15μs NIC packet latency). Packets are placed into a lock-free Single-Producer Single-Consumer (SPSC) ring buffer to decouple network I/O from pricing evaluation. The pricing core dynamically constructs the synthetic CME CF Bitcoin Real-Time Index (BRTI) to calculate spot lead-lag drift against the Kalshi prediction contract order book, executing 60-second TWAP pinning orders with Quarter-Kelly risk capital allocation.
        </p>
      `,
      invariantsHtml: `
        <table class="spec-table">
          <thead>
            <tr>
              <th>System Component</th>
              <th>Specification / Metric</th>
              <th>Architectural Invariant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="spec-key">Network Virtualization</td>
              <td class="spec-val">Azure SR-IOV (&lt; 15μs)</td>
              <td>Bypasses hypervisor virtual switch to route network frames directly to VM memory.</td>
            </tr>
            <tr>
              <td class="spec-key">Hardware Timekeeping</td>
              <td class="spec-val">Azure PTP /dev/ptp0 (&lt; 5μs)</td>
              <td>IEEE 1588 Precision Time Protocol bounds timestamp drift against exchange matching clocks.</td>
            </tr>
            <tr>
              <td class="spec-key">Pricing Logic</td>
              <td class="spec-val">Synthetic BRTI Replication</td>
              <td>Volume-weighted multi-venue synthetic spot index; rejects curve-fit predictive heuristics.</td>
            </tr>
            <tr>
              <td class="spec-key">Arbitrage Mechanism</td>
              <td class="spec-val">60s TWAP Pinning</td>
              <td>Exploits deterministic settlement pricing dynamics in final contract minute.</td>
            </tr>
            <tr>
              <td class="spec-key">Audit WAL Chain</td>
              <td class="spec-val">SHA-256 Hash Chaining</td>
              <td>Every state transition is cryptographically signed via RSA-PSS and chained in TimescaleDB.</td>
            </tr>
            <tr>
              <td class="spec-key">Live Verification</td>
              <td class="spec-val">81.8% Win Rate // 2.14 PF</td>
              <td>Realized session PnL +$110.52 USD across verified production markets.</td>
            </tr>
          </tbody>
        </table>
      `
    },
    pixellabz: {
      title: 'PixelLabz Global RPC Mesh — High-Throughput Galactic Beacon Network',
      image: 'assets/screenshots/pixellabz.png',
      desc: 'Purpose-built non-consensus Solana RPC network spanning 15+ bare-metal servers across the U.S., Germany, and Singapore. Features 1,000 RPS limit per node, 0s landing time with same-block transaction inclusion, full Geyser / Yellowstone real-time streaming plugin support, and IP-whitelisted endpoint security. Validated across 8M+ transactions maintaining 99.99% uptime for 4,000+ active users with ~$180,000 in platform revenue.',
      topologyHtml: `
        <div style="background-color: rgba(6, 4, 18, 0.75); border: 1px dashed var(--neon-mint); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-family: var(--font-mono); font-size: 10.5px; color: var(--neon-mint); font-weight: 700;">STARLIGHT BEACON TOPOLOGY &amp; STREAMING</span>
            <span style="font-family: var(--font-hand); font-size: 15px; color: var(--neon-gold);">"1,000 RPS / Tower · 0s Landing Time 🚀"</span>
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-mint);">01 // CLIENT</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">4,000+ Users</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">Traders &amp; HFT Bots</span>
            </div>
            <div style="color: var(--neon-gold); align-self: center;">──▶</div>
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-mint);">02 // EDGE</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">Anycast GeoDNS</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">DDoS Shield &amp; IP Filter</span>
            </div>
            <div style="color: var(--neon-gold); align-self: center;">──▶</div>
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-mint);">03 // BEACONS</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">15+ Bare-Metal</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">Ashburn · Frankfurt · SG</span>
            </div>
            <div style="color: var(--neon-gold); align-self: center;">──▶</div>
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-mint);">04 // STREAMING</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">Yellowstone gRPC</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">Dragon's Mouth Plug</span>
            </div>
            <div style="color: var(--neon-gold); align-self: center;">──▶</div>
            <div style="background: rgba(18, 13, 47, 0.8); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; min-width: 140px;">
              <span style="font-family: var(--font-mono); font-size: 9px; color: var(--neon-mint);">05 // LANDING</span>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #FFFFFF;">0s Same-Block</div>
              <span style="font-size: 9.5px; color: var(--text-secondary);">Solana &amp; Aptos Core</span>
            </div>
          </div>
        </div>

        <p class="lightbox-desc">
          <strong>Beacon Mesh Architecture:</strong> Deploys bare-metal Linux servers in tier-1 data centers (Ashburn, Frankfurt, Singapore) colocated near major Solana validator clusters. Dedicated non-consensus RPC nodes utilize custom socket buffer configurations and the Yellowstone Dragon's Mouth gRPC plugin to bypass standard JSON-RPC overhead. Transactions achieve same-block landing (0s latency) by streaming directly to leading block producers and Jito MEV relays.
        </p>
      `,
      invariantsHtml: `
        <table class="spec-table">
          <thead>
            <tr>
              <th>System Component</th>
              <th>Specification / Metric</th>
              <th>Architectural Invariant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="spec-key">Node Cluster</td>
              <td class="spec-val">15+ Bare-Metal Nodes</td>
              <td>Bare-metal Linux servers deployed across Ashburn (US), Frankfurt (EU), and Singapore (APAC).</td>
            </tr>
            <tr>
              <td class="spec-key">Throughput Capacity</td>
              <td class="spec-val">1,000 RPS / Node</td>
              <td>Sustained RPC request ceiling under high-frequency trading and token mint stress.</td>
            </tr>
            <tr>
              <td class="spec-key">Transaction Landing</td>
              <td class="spec-val">0s (Same Block)</td>
              <td>Sub-second transaction inclusion via direct gRPC validator peer streaming and Jito relays.</td>
            </tr>
            <tr>
              <td class="spec-key">Streaming Engine</td>
              <td class="spec-val">Yellowstone / Geyser gRPC</td>
              <td>Sub-millisecond pub/sub account and block telemetry streaming.</td>
            </tr>
            <tr>
              <td class="spec-key">Reliability &amp; Scale</td>
              <td class="spec-val">99.99% Availability // 8M+ Tx</td>
              <td>Automated health audits and BPF socket filtering ensure zero dropped requests during congestion.</td>
            </tr>
            <tr>
              <td class="spec-key">Revenue &amp; Users</td>
              <td class="spec-val">~$180,000 // 4,000+ Users</td>
              <td>Commercialized platform access with token gating and enterprise IP-whitelisting.</td>
            </tr>
          </tbody>
        </table>
      `
    }
  };

  function setLightboxTab(tabKey) {
    lightboxTabs.forEach((tab) => {
      const isActive = tab.dataset.tab === tabKey;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    Object.keys(tabPanels).forEach((key) => {
      if (tabPanels[key]) {
        tabPanels[key].style.display = key === tabKey ? 'flex' : 'none';
      }
    });
  }

  function openLightbox(projectId) {
    const data = celestialGrimoire[projectId];
    if (!data) return;

    lightboxTitle.textContent = data.title;
    lightboxDesc.textContent = data.desc;
    lightboxMedia.innerHTML = `<img src="${data.image}" alt="${data.title}" loading="lazy" />`;
    lightboxArchDetails.innerHTML = data.topologyHtml;
    lightboxInvariantsDetails.innerHTML = data.invariantsHtml;

    setLightboxTab('preview');
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  // Open modal triggers
  document.querySelectorAll('.btn-inspect, .wave-stage-container, .mesh-stage-container').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.closest('[data-project-id]');
      if (card) {
        openLightbox(card.dataset.projectId);
      }
    });
  });

  // Tab switching
  lightboxTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setLightboxTab(tab.dataset.tab);
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('is-active')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const tabs = Array.from(lightboxTabs);
        const currentIndex = tabs.findIndex((t) => t.classList.contains('is-active'));
        if (currentIndex !== -1) {
          const nextIndex = e.key === 'ArrowRight'
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length;
          setLightboxTab(tabs[nextIndex].dataset.tab);
        }
      }
    }
  });

  // =========================================================================
  // 7. Live Eastern Time Star-Clock (America/New_York via Intl)
  // =========================================================================
  const liveClock = document.getElementById('live-clock');

  function updateClock() {
    if (!liveClock) return;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
      });
      liveClock.textContent = `${formatter.format(now)} ⭐`;
    } catch {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      liveClock.textContent = `${hours}:${minutes}:${seconds} EDT ⭐`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
});
