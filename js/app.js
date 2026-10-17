/**
 * MINIMALIST LIQUID GLASS INTERACTIVE PORTFOLIO // CORE ENGINE
 * Features:
 * - Real-time WebGL fluid caustics & optical refraction canvas (60 FPS, idle-throttled)
 * - 3D gyro-reactive perspective tilt with specular rim glare on crystalline prism cards
 * - Liquid discipline filter slider with elastic physical snapping
 * - Magnifying Glass case study overlay with elastic zoom transitions
 * - IntersectionObserver scroll reveal system
 * - Eastern Time precision star-clock
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================================================
  // 1. WebGL Liquid Glass Caustics Canvas
  // =========================================================================
  const canvas = document.getElementById('liquid-canvas');
  let gl = null;

  if (canvas && !prefersReducedMotion) {
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch {
      gl = null;
    }
  }

  if (gl) {
    // Fullscreen Quad Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Optical Caustic Refraction Fragment Shader
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      varying vec2 v_uv;

      // Simplex noise approximation for caustics
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 mouse = u_mouse / u_resolution;
        float dist = distance(uv, mouse);

        // Fluid liquid ripples & caustics
        float t = u_time * 0.18;
        float wave1 = snoise(uv * 2.8 + vec2(t * 0.6, t * 0.4));
        float wave2 = snoise(uv * 5.2 - vec2(t * 0.4, t * 0.7));
        float caustic = (wave1 + wave2 * 0.5) * 0.5;

        // Optical mouse refraction displacement
        float mouseWave = smoothstep(0.45, 0.0, dist) * 0.12;
        vec2 displacedUv = uv + vec2(caustic * 0.015, caustic * 0.02) + (uv - mouse) * mouseWave;

        // Chromatic dispersion (prismatic RGB split on wave peaks)
        float r = snoise(displacedUv * 3.4 + vec2(0.008, 0.0));
        float g = snoise(displacedUv * 3.4);
        float b = snoise(displacedUv * 3.4 - vec2(0.008, 0.0));

        // Deep obsidian base with delicate refraction luminosity
        vec3 base = vec3(0.031, 0.035, 0.047); // #08090C
        vec3 refraction = vec3(r * 0.04 + 0.02, g * 0.045 + 0.022, b * 0.055 + 0.025);
        
        // Specular caustic rim
        float highlight = pow(max(0.0, caustic), 3.0) * 0.15;
        vec3 finalColor = base + refraction * 0.5 + vec3(highlight);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (vertexShader && fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
          gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
        const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
        const timeLoc = gl.getUniformLocation(program, 'u_time');

        let targetMouseX = window.innerWidth / 2;
        let targetMouseY = window.innerHeight / 2;
        let currentMouseX = targetMouseX;
        let currentMouseY = targetMouseY;
        let isIdle = false;
        let idleTimer = null;
        let rafId = null;

        function resize() {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = window.innerWidth * dpr;
          canvas.height = window.innerHeight * dpr;
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
        }
        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousemove', (e) => {
          targetMouseX = e.clientX * (window.devicePixelRatio || 1);
          targetMouseY = (window.innerHeight - e.clientY) * (window.devicePixelRatio || 1);
          if (isIdle) {
            isIdle = false;
            if (!rafId) rafId = requestAnimationFrame(render);
          }
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            isIdle = true;
          }, 3000);
        }, { passive: true });

        let startTime = performance.now();
        function render(now) {
          const elapsed = (now - startTime) * 0.001;

          // Damped mercury lerp
          currentMouseX += (targetMouseX - currentMouseX) * 0.06;
          currentMouseY += (targetMouseY - currentMouseY) * 0.06;

          gl.uniform1f(timeLoc, elapsed);
          gl.uniform2f(mouseLoc, currentMouseX, currentMouseY);

          gl.drawArrays(gl.TRIANGLES, 0, 6);

          if (!isIdle || Math.abs(targetMouseX - currentMouseX) > 1.0) {
            rafId = requestAnimationFrame(render);
          } else {
            rafId = null;
          }
        }
        rafId = requestAnimationFrame(render);

        document.addEventListener('visibilitychange', () => {
          if (document.hidden && rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          } else if (!document.hidden && !rafId) {
            startTime = performance.now();
            rafId = requestAnimationFrame(render);
          }
        });
      }
    }
  }

  // =========================================================================
  // 2. Optical Mercury Cursor Spotlight
  // =========================================================================
  const cursorSpot = document.getElementById('cursor-spotlight');
  if (cursorSpot && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let isMoving = false;
    let spotRaf = null;

    function animateSpotlight() {
      curX += (mouseX - curX) * 0.08;
      curY += (mouseY - curY) * 0.08;

      cursorSpot.style.left = `${curX}px`;
      cursorSpot.style.top = `${curY}px`;

      if (Math.abs(mouseX - curX) + Math.abs(mouseY - curY) > 0.3) {
        spotRaf = requestAnimationFrame(animateSpotlight);
      } else {
        spotRaf = null;
      }
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        cursorSpot.style.opacity = '1';
      }
      if (!spotRaf) {
        spotRaf = requestAnimationFrame(animateSpotlight);
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      cursorSpot.style.opacity = '0';
      isMoving = false;
    });
  }

  // =========================================================================
  // 3. Floating Prism Project Dock (3D Gyro-Reactive Perspective Tilt)
  // =========================================================================
  const prismCards = document.querySelectorAll('.prism-card');

  if (!prefersReducedMotion) {
    prismCards.forEach((card) => {
      const glare = card.querySelector('.prism-specular-glare');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Subtle 3D perspective tilt
        card.style.transform = `perspective(1200px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-2px)`;

        // Specular rim light glare shifts towards mouse coordinates
        if (glare) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          glare.style.background = `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.12) 0%, transparent 65%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // =========================================================================
  // 4. Liquid Discipline Filter Bar (Elastic Physical Slider)
  // =========================================================================
  const filterDock = document.querySelector('.filter-glass-dock');
  const filterThumb = document.getElementById('filter-thumb');
  const filterBtns = document.querySelectorAll('.filter-pill-btn');

  function updateFilterSlider(activeBtn) {
    if (!filterDock || !filterThumb || !activeBtn) return;
    const btnRect = activeBtn.getBoundingClientRect();
    const dockRect = filterDock.getBoundingClientRect();

    const left = btnRect.left - dockRect.left;
    const width = btnRect.width;

    filterThumb.style.transform = `translateX(${left}px)`;
    filterThumb.style.width = `${width}px`;
  }

  // Position on init
  const initialActive = document.querySelector('.filter-pill-btn.is-active');
  if (initialActive) {
    // Delay slightly for font layout
    setTimeout(() => updateFilterSlider(initialActive), 80);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      updateFilterSlider(btn);

      const filterVal = btn.dataset.filter;

      // Filter prism cards
      prismCards.forEach((card) => {
        const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px) scale(0.97)';
          setTimeout(() => {
            if (btn.dataset.filter !== 'all' && !card.dataset.category.includes(btn.dataset.filter)) {
              card.style.display = 'none';
            }
          }, 250);
        }
      });
    });
  });

  window.addEventListener('resize', () => {
    const curActive = document.querySelector('.filter-pill-btn.is-active');
    if (curActive) updateFilterSlider(curActive);
  });

  // =========================================================================
  // 5. Interactive Project Overlay ("The Magnifying Glass" Case Study)
  // =========================================================================
  const overlay = document.getElementById('project-overlay');
  const overlayCloseBtn = document.getElementById('overlay-close-btn');
  const overlayTitle = document.getElementById('overlay-title');
  const overlaySubtitle = document.getElementById('overlay-subtitle');
  const overlayMedia = document.getElementById('overlay-media');
  const overlayDesc = document.getElementById('overlay-desc');
  const overlayPipeline = document.getElementById('overlay-pipeline-content');
  const overlayInvariants = document.getElementById('overlay-invariants-content');
  const overlayTabs = document.querySelectorAll('.overlay-tab');

  const tabPanels = {
    preview: document.getElementById('overlay-tab-preview'),
    pipeline: document.getElementById('overlay-tab-pipeline'),
    invariants: document.getElementById('overlay-tab-invariants')
  };

  const caseStudies = {
    sync: {
      title: 'sync // KXBTC15M — Quantitative Market Microstructure Architecture',
      subtitle: 'Kalshi 15-Minute Bitcoin Binary Prediction Engine · Closed-Form Microstructure',
      image: 'assets/screenshots/sync.png',
      desc: 'Deterministic market-microstructure trading bot and telemetry dashboard purpose-built for Kalshi KXBTC15M prediction markets. Rejects curve-fit multi-strategy ensembles in favor of closed-form microstructure pricing: Synthetic BRTI Lead-Lag Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage, sub-millisecond execution routing, and SHA-256 tamper-evident cryptographic trade logging.',
      pipelineHtml: `
        <div class="pipeline-ribbon" style="margin-bottom: 16px;">
          <div class="pipeline-header">
            <span>DATA PLANE &amp; EXECUTION PIPELINE</span>
            <span style="color: #EDEDED;">SR-IOV &lt; 15μs INGRESS · 11ms EXCHANGE RTT</span>
          </div>
          <div class="pipeline-flow">
            <div class="pipeline-step">
              <span class="step-meta">01 // INGRESS</span>
              <span class="step-label">Exchange Feeds</span>
              <span class="step-spec">Coinbase · Kraken · Bitstamp</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">02 // BYPASS</span>
              <span class="step-label">Azure SR-IOV</span>
              <span class="step-spec">Lock-Free SPSC Ring Buffer</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">03 // PRICING</span>
              <span class="step-label">BRTI Lead-Lag</span>
              <span class="step-spec">60s TWAP Pinning Arbitrage</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">04 // GATEWAY</span>
              <span class="step-label">Kalshi Dispatch</span>
              <span class="step-spec">Sub-ms Low-Latency Order Route</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">05 // AUDIT</span>
              <span class="step-label">SHA-256 WAL</span>
              <span class="step-spec">TimescaleDB Chained Log</span>
            </div>
          </div>
        </div>
        <p class="overlay-desc">
          <strong>Optical System Breakdown:</strong> The engine consumes raw Level-2 and Level-3 WebSocket streams directly from spot liquidity venues through an Azure SR-IOV virtualized NIC (&lt;15μs NIC packet latency). Packets are placed into a lock-free Single-Producer Single-Consumer (SPSC) ring buffer to decouple network I/O from pricing evaluation. The pricing core dynamically constructs the synthetic CME CF Bitcoin Real-Time Index (BRTI) to calculate spot lead-lag drift against the Kalshi prediction contract order book, executing 60-second TWAP pinning orders with Quarter-Kelly risk capital allocation.
        </p>
      `,
      invariantsHtml: `
        <table class="spec-table">
          <thead>
            <tr>
              <th>System Component</th>
              <th>Specification / Latency</th>
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
      title: 'PixelLabz Global RPC Mesh — Multi-Region Infrastructure',
      subtitle: 'Non-Consensus Bare-Metal Node Fabric on Solana & Aptos · 8M+ Transactions',
      image: 'assets/screenshots/pixellabz.png',
      desc: 'Purpose-built non-consensus Solana RPC network spanning 15+ bare-metal servers across the U.S., Germany, and Singapore. Features 1,000 RPS limit per node, 0s landing time with same-block transaction inclusion, full Geyser / Yellowstone real-time streaming plugin support, and IP-whitelisted endpoint security. Validated across 8M+ transactions maintaining 99.99% uptime for 4,000+ active users with ~$180,000 in platform revenue.',
      pipelineHtml: `
        <div class="pipeline-ribbon" style="margin-bottom: 16px;">
          <div class="pipeline-header">
            <span>MULTI-REGION MESH TOPOLOGY &amp; STREAMING PIPELINE</span>
            <span style="color: #EDEDED;">1,000 RPS / NODE · 0s LANDING TIME</span>
          </div>
          <div class="pipeline-flow">
            <div class="pipeline-step">
              <span class="step-meta">01 // INGRESS</span>
              <span class="step-label">4,000+ Users</span>
              <span class="step-spec">Traders &amp; High-Frequency Bots</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">02 // EDGE</span>
              <span class="step-label">Anycast GeoDNS</span>
              <span class="step-spec">DDoS Shield &amp; IP Whitelist</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">03 // GATEWAY</span>
              <span class="step-label">Regional Fabric</span>
              <span class="step-spec">Ashburn · Frankfurt · Singapore</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">04 // BARE-METAL</span>
              <span class="step-label">15+ Nodes</span>
              <span class="step-spec">1,000 RPS Throughput Ceiling</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">05 // STREAM</span>
              <span class="step-label">Yellowstone gRPC</span>
              <span class="step-spec">0s Same-Block Landing</span>
            </div>
          </div>
        </div>
        <p class="overlay-desc">
          <strong>Mesh Architecture Breakdown:</strong> Bare-metal Linux servers provisioned in tier-1 data centers (Ashburn, Frankfurt, Singapore) colocated near major Solana validator clusters. Dedicated non-consensus RPC nodes utilize custom socket buffer configurations and the Yellowstone Dragon's Mouth gRPC plugin to bypass standard JSON-RPC overhead. Transactions dispatched through the network achieve same-block landing (0s latency) by streaming directly to leading block producers and Jito MEV relays.
        </p>
      `,
      invariantsHtml: `
        <table class="spec-table">
          <thead>
            <tr>
              <th>System Component</th>
              <th>Specification / Scale</th>
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
    },
    nodestop: {
      title: 'NodeStop Enterprise Security Infrastructure',
      subtitle: 'Information Security Analyst Intern — Threat Hunting & Deep Packet Telemetry',
      image: '',
      desc: 'Conducted enterprise vulnerability assessments, risk analyses, and real-time network traffic monitoring using Snort IDS and Wireshark, inspecting raw packet streams for intrusion signatures. Executed structured penetration testing and credential fuzzing exercises with Nmap, Nessus, Hydra, and Medusa, authoring risk remediation plans for senior security engineers.',
      pipelineHtml: `
        <div class="pipeline-ribbon" style="margin-bottom: 16px;">
          <div class="pipeline-header">
            <span>SECURITY RECONNAISSANCE &amp; REMEDIATION PIPELINE</span>
            <span style="color: #EDEDED;">PACKET TELEMETRY &amp; MITIGATION</span>
          </div>
          <div class="pipeline-flow">
            <div class="pipeline-step">
              <span class="step-meta">01 // INGRESS</span>
              <span class="step-label">Network Traffic</span>
              <span class="step-spec">Raw Packet Stream</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">02 // INSPECT</span>
              <span class="step-label">Snort IDS</span>
              <span class="step-spec">Deep Packet Signature Match</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">03 // FUZZING</span>
              <span class="step-label">Nmap &amp; Nessus</span>
              <span class="step-spec">Attack Surface Audits</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">04 // ANALYSIS</span>
              <span class="step-label">Remediation Plan</span>
              <span class="step-spec">Vulnerability Triage</span>
            </div>
            <div class="pipeline-arrow">──▶</div>
            <div class="pipeline-step">
              <span class="step-meta">05 // SIEM</span>
              <span class="step-label">Compliance Log</span>
              <span class="step-spec">Mitigation Record</span>
            </div>
          </div>
        </div>
        <p class="overlay-desc">
          <strong>Security Engineering Scope:</strong> Executed systematic network defense, auditing core port topologies and ingress vectors. Authored remediation playbooks reducing organizational threat surfaces and monitored active penetration response drills.
        </p>
      `,
      invariantsHtml: `
        <table class="spec-table">
          <thead>
            <tr>
              <th>Security Component</th>
              <th>Toolchain / Methodology</th>
              <th>Operational Function</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="spec-key">Intrusion Detection</td>
              <td class="spec-val">Snort IDS &amp; Wireshark</td>
              <td>Raw packet inspection and anomaly rule definition for enterprise subnets.</td>
            </tr>
            <tr>
              <td class="spec-key">Vulnerability Assessment</td>
              <td class="spec-val">Nmap, Nessus, Hydra</td>
              <td>Network reconnaissance, service enumeration, and credential fuzzing drills.</td>
            </tr>
            <tr>
              <td class="spec-key">Incident Response</td>
              <td class="spec-val">Threat Hunting &amp; SIEM</td>
              <td>Structured remediation protocols authored for senior security engineering staff.</td>
            </tr>
          </tbody>
        </table>
      `
    }
  };

  function setOverlayTab(tabKey) {
    overlayTabs.forEach((tab) => {
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

  function openOverlay(projectId) {
    const data = caseStudies[projectId];
    if (!data) return;

    overlayTitle.textContent = data.title;
    overlaySubtitle.textContent = data.subtitle;
    overlayDesc.textContent = data.desc;

    if (data.image) {
      overlayMedia.style.display = 'flex';
      overlayMedia.innerHTML = `<img src="${data.image}" alt="${data.title}" loading="lazy" />`;
    } else {
      overlayMedia.style.display = 'none';
      overlayMedia.innerHTML = '';
    }

    overlayPipeline.innerHTML = data.pipelineHtml;
    overlayInvariants.innerHTML = data.invariantsHtml;

    setOverlayTab('preview');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  // Open triggers
  document.querySelectorAll('.btn-open-overlay, .prism-media-viewport').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.closest('.prism-card');
      if (card) {
        openOverlay(card.dataset.projectId);
      }
    });
  });

  overlayTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setOverlayTab(tab.dataset.tab);
    });
  });

  if (overlayCloseBtn) overlayCloseBtn.addEventListener('click', closeOverlay);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (overlay && overlay.classList.contains('is-active')) {
      if (e.key === 'Escape') {
        closeOverlay();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const tabs = Array.from(overlayTabs);
        const curIdx = tabs.findIndex((t) => t.classList.contains('is-active'));
        if (curIdx !== -1) {
          const nextIdx = e.key === 'ArrowRight'
            ? (curIdx + 1) % tabs.length
            : (curIdx - 1 + tabs.length) % tabs.length;
          setOverlayTab(tabs[nextIdx].dataset.tab);
        }
      }
    }
  });

  // =========================================================================
  // 6. Scrolling Reveal System
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
  // 7. Live Eastern Time Clock
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
