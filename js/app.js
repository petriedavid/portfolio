/**
 * GEIST MONOCHROME // SYSTEMS ARCHITECTURE CONTROLLER
 * Features:
 * - High-performance IntersectionObserver scroll reveal system
 * - Viscous mouse cursor light trail with idle throttle (0% CPU when idle)
 * - Systems Architecture Inspector modal with 3 detailed tabs (Interface, Topology, Invariants)
 * - Accurate Eastern Time clock (EDT/EST) via Intl API
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Scrolling Reveal System (IntersectionObserver + Staggering)
  // =========================================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  // 2. Viscous Ambient Mouse Cursor Light Trail (Idle-Throttled Physics)
  // =========================================================================
  const cursorGlow = document.getElementById('cursor-glow');

  if (cursorGlow && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isMoving = false;
    let rafId = null;
    let idleTimer = null;

    function renderCursor() {
      // 0.085 damping factor creates that luxurious viscous liquid glass feel
      currentX += (mouseX - currentX) * 0.085;
      currentY += (mouseY - currentY) * 0.085;

      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;

      // Check if settled to under 0.2px delta
      const delta = Math.abs(mouseX - currentX) + Math.abs(mouseY - currentY);
      if (delta > 0.2) {
        rafId = requestAnimationFrame(renderCursor);
      } else {
        rafId = null;
      }
    }

    function wakeCursor() {
      if (!isMoving) {
        isMoving = true;
        cursorGlow.style.opacity = '1';
      }
      if (!rafId) {
        rafId = requestAnimationFrame(renderCursor);
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }, 1500);
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      wakeCursor();
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
      isMoving = false;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }

  // =========================================================================
  // 3. Systems Architecture Inspector Modal (Tabbed Engine)
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

  const systemsDossier = {
    sync: {
      title: 'sync // KXBTC15M — Quantitative Microstructure & Telemetry Architecture',
      image: 'assets/screenshots/sync.png',
      desc: 'Deterministic market-microstructure trading bot and telemetry dashboard purpose-built for Kalshi KXBTC15M prediction markets. Employs Synthetic BRTI Lead-Lag Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage, sub-millisecond execution routing, and SHA-256 tamper-evident cryptographic trade logging.',
      topologyHtml: `
        <div class="arch-pipeline" style="margin-bottom: 16px;">
          <div class="arch-pipeline-label">
            <span>DATA PLANE &amp; PIPELINE FLOW</span>
            <span style="color: var(--signal-blue);">&lt; 15μs INGRESS · 11ms EXCHANGE RTT</span>
          </div>
          <div class="arch-pipeline-flow">
            <div class="pipeline-node">
              <span class="node-step">01 // INGRESS</span>
              <span class="node-name">Exchange Feeds</span>
              <span class="node-meta">Coinbase / Kraken / Bitstamp WS</span>
            </div>
            <div class="pipeline-connector">──▶</div>
            <div class="pipeline-node">
              <span class="node-step">02 // KERNEL BYPASS</span>
              <span class="node-name">Azure SR-IOV</span>
              <span class="node-meta">Lock-Free SPSC Ring Buffer</span>
            </div>
            <div class="pipeline-connector">──▶</div>
            <div class="pipeline-node">
              <span class="node-step">03 // PRICING CORE</span>
              <span class="node-name">BRTI Lead-Lag</span>
              <span class="node-meta">60s TWAP Pinning Arbitrage</span>
            </div>
            <div class="pipeline-connector">──▶</div>
            <div class="pipeline-node">
              <span class="node-step">04 // EXECUTION</span>
              <span class="node-name">Kalshi Gateway</span>
              <span class="node-meta">Sub-ms Order Dispatch</span>
            </div>
            <div class="pipeline-connector">──▶</div>
            <div class="pipeline-node">
              <span class="node-step">05 // AUDITING</span>
              <span class="node-name">TimescaleDB WAL</span>
              <span class="node-meta">SHA-256 Chained Hash Log</span>
            </div>
          </div>
        </div>

        <p class="lightbox-desc">
          <strong>Architecture Summary:</strong> The engine consumes raw Level-2 and Level-3 WebSocket streams directly from spot liquidity venues through an Azure SR-IOV virtualized NIC (&lt;15μs NIC packet latency). Packets are placed into a lock-free Single-Producer Single-Consumer (SPSC) ring buffer to decouple network I/O from pricing evaluation. The pricing core dynamically constructs the synthetic CME CF Bitcoin Real-Time Index (BRTI) to calculate spot lead-lag drift against the Kalshi prediction contract order book, executing 60-second TWAP pinning orders with Quarter-Kelly risk capital allocation.
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
              <td class="spec-notes">Bypasses hypervisor virtual switch to route network frames directly to VM memory.</td>
            </tr>
            <tr>
              <td class="spec-key">Hardware Timekeeping</td>
              <td class="spec-val">Azure PTP /dev/ptp0 (&lt; 5μs)</td>
              <td class="spec-notes">IEEE 1588 Precision Time Protocol bounds timestamp drift against exchange matching clocks.</td>
            </tr>
            <tr>
              <td class="spec-key">Pricing Logic</td>
              <td class="spec-val">Synthetic BRTI Replication</td>
              <td class="spec-notes">Volume-weighted multi-venue synthetic spot index; rejects curve-fit predictive heuristics.</td>
            </tr>
            <tr>
              <td class="spec-key">Arbitrage Mechanism</td>
              <td class="spec-val">60s TWAP Pinning</td>
              <td class="spec-notes">Exploits deterministic settlement pricing dynamics in final contract minute.</td>
            </tr>
            <tr>
              <td class="spec-key">Audit WAL Chain</td>
              <td class="spec-val">SHA-256 Hash Chaining</td>
              <td class="spec-notes">Every state transition is cryptographically signed via RSA-PSS and chained in TimescaleDB.</td>
            </tr>
            <tr>
              <td class="spec-key">Live Verification</td>
              <td class="spec-val">81.8% Win Rate // 2.14 PF</td>
              <td class="spec-notes">Realized session PnL +$110.52 USD across verified production markets.</td>
            </tr>
          </tbody>
        </table>
      `
    },
    pixellabz: {
      title: 'PixelLabz Global RPC Mesh — High-Throughput Solana & Aptos Node Fabric',
      image: 'assets/screenshots/pixellabz.png',
      desc: 'Purpose-built non-consensus Solana RPC network spanning 15+ bare-metal servers across the U.S., Germany, and Singapore. Features 1,000 RPS limit per node, 0s landing time with same-block transaction inclusion, full Geyser / Yellowstone real-time streaming plugin support, and IP-whitelisted endpoint security. Validated across 8M+ transactions maintaining 99.99% uptime for 4,000+ active users with ~$180,000 in platform revenue.',
      topologyHtml: `
        <div class="arch-pipeline" style="margin-bottom: 16px;">
          <div class="arch-pipeline-label">
            <span>MULTI-REGION MESH TOPOLOGY &amp; STREAMING PIPELINE</span>
            <span style="color: var(--signal-blue);">1,000 RPS / NODE · 0s LANDING TIME</span>
          </div>
          <div class="arch-pipeline-flow">
            <div class="pipeline-node">
              <span class="node-step">01 // INGRESS</span>
              <span class="node-name">Client Layer</span>
              <span class="node-meta">4,000+ Users &amp; HFT Bots</span>
            </div>
            <div class="pipeline-connector">──▶</div>
            <div class="pipeline-node">
              <span class="node-step">02 // EDGE</span>
              <span class="node-name">Anycast GeoDNS</span>
              <span class="node-meta">DDoS Mitigation &amp; IP Whitelist</span>
            </div>
            <div class="pipeline-connector">──▶</div>
            <div class="pipeline-node">
              <span class="node-step">03 // GATEWAY</span>
              <span class="node-name">Regional Fabric</span>
              <span class="node-meta">Ashburn · Frankfurt · Singapore</span>
            </div>
            <div class="pipeline-connector">──▶</div>
            <div class="pipeline-node">
              <span class="node-step">04 // BARE-METAL</span>
              <span class="node-name">15+ Linux Nodes</span>
              <span class="node-meta">1,000 RPS Throughput Ceiling</span>
            </div>
            <div class="pipeline-connector">──▶</div>
            <div class="pipeline-node">
              <span class="node-step">05 // STREAMING</span>
              <span class="node-name">Yellowstone gRPC</span>
              <span class="node-meta">0s Same-Block Landing</span>
            </div>
          </div>
        </div>

        <p class="lightbox-desc">
          <strong>Mesh Architecture Summary:</strong> The PixelLabz infrastructure deploys bare-metal Linux servers provisioned in tier-1 data centers (Ashburn, Frankfurt, Singapore) colocated near major Solana validator clusters. Dedicated non-consensus RPC nodes utilize custom socket buffer configurations and the Yellowstone Dragon’s Mouth gRPC plugin to bypass standard JSON-RPC overhead. Transactions dispatched through the network achieve same-block landing (0s latency) by streaming directly to leading block producers and Jito MEV relays.
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
              <td class="spec-notes">Bare-metal Linux servers deployed across Ashburn (US), Frankfurt (EU), and Singapore (APAC).</td>
            </tr>
            <tr>
              <td class="spec-key">Throughput Capacity</td>
              <td class="spec-val">1,000 RPS / Node</td>
              <td class="spec-notes">Sustained RPC request ceiling under high-frequency trading and token mint stress.</td>
            </tr>
            <tr>
              <td class="spec-key">Transaction Landing</td>
              <td class="spec-val">0s (Same Block)</td>
              <td class="spec-notes">Sub-second transaction inclusion via direct gRPC validator peer streaming and Jito relays.</td>
            </tr>
            <tr>
              <td class="spec-key">Streaming Engine</td>
              <td class="spec-val">Yellowstone / Geyser gRPC</td>
              <td class="spec-notes">Sub-millisecond pub/sub account and block telemetry streaming.</td>
            </tr>
            <tr>
              <td class="spec-key">Reliability &amp; Scale</td>
              <td class="spec-val">99.99% Availability // 8M+ Tx</td>
              <td class="spec-notes">Automated health audits and BPF socket filtering ensure zero dropped requests during network congestion.</td>
            </tr>
            <tr>
              <td class="spec-key">Revenue &amp; Users</td>
              <td class="spec-val">~$180,000 // 4,000+ Users</td>
              <td class="spec-notes">Commercialized platform access with token gating and enterprise IP-whitelisting.</td>
            </tr>
          </tbody>
        </table>
      `
    }
  };

  let activeProject = null;

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
    const data = systemsDossier[projectId];
    if (!data) return;

    activeProject = data;
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
  document.querySelectorAll('.btn-inspect, .project-image-slot').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.closest('.project-card');
      if (card) {
        const projectId = card.dataset.projectId;
        openLightbox(projectId);
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
  // 4. Live Eastern Time Clock (America/New_York via Intl)
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
      liveClock.textContent = formatter.format(now);
    } catch {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      liveClock.textContent = `${hours}:${minutes}:${seconds} EDT`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
});
