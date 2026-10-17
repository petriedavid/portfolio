/**
 * PORTFOLIO APPLICATION CONTROLLER
 * Inspired by Shiyun Lu (shiyunlu.com)
 * 
 * Orchestrates:
 * - Interactive Three.js Physics Canvas initialization
 * - Minimalist Technical HUD / Debug controls binding
 * - Editorial project case study modal overlay
 * - Live Eastern Time star-clock
 */

import { PhysicsCanvas } from './physics-engine.js';

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Initialize Interactive Physics Canvas
  // =========================================================================
  const canvasContainer = document.getElementById('canvas-container');
  let physics = null;

  if (canvasContainer) {
    physics = new PhysicsCanvas(canvasContainer, {
      sphereCount: window.innerWidth < 768 ? 16 : 30,
      gravityType: 'none',
      restitution: 0.92,
      mouseForceMode: 'repel',
      mouseRadius: 6.5,
      mouseStrength: 0.85,
      materialTheme: 'obsidian',
      cameraParallax: true
    });
  }

  // =========================================================================
  // 2. Technical HUD / Physics Debug Controls
  // =========================================================================
  const hudPanel = document.getElementById('hud-panel');
  const hudToggleHeader = document.getElementById('hud-toggle-header');
  const hudToggleBtnNav = document.getElementById('btn-hud-nav');
  const hudMinimizeBtn = document.getElementById('hud-minimize-btn');
  const hudResetBtn = document.getElementById('hud-reset-btn');
  const hudScatterBtn = document.getElementById('hud-scatter-btn');
  const hudFpsBadge = document.getElementById('hud-fps-val');

  // Live FPS telemetry
  if (physics && hudFpsBadge) {
    physics.onFpsUpdate = (fps) => {
      hudFpsBadge.textContent = `${fps} FPS`;
    };
  }

  // HUD Collapsible Toggle
  function toggleHud(forceState) {
    if (!hudPanel) return;
    if (typeof forceState === 'boolean') {
      hudPanel.classList.toggle('is-collapsed', !forceState);
    } else {
      hudPanel.classList.toggle('is-collapsed');
    }
  }

  if (hudToggleHeader) hudToggleHeader.addEventListener('click', () => toggleHud());
  if (hudMinimizeBtn) {
    hudMinimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHud();
    });
  }
  if (hudToggleBtnNav) {
    hudToggleBtnNav.addEventListener('click', () => {
      toggleHud(true);
      hudPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // Reset & Scatter
  if (hudResetBtn && physics) {
    hudResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      physics.resetScene();
    });
  }
  if (hudScatterBtn && physics) {
    hudScatterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      physics.scatterSpheres();
    });
  }

  // Sphere Count Toggles
  const countBtns = document.querySelectorAll('[data-hud-count]');
  countBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      countBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const count = parseInt(btn.dataset.hudCount, 10);
      if (physics) physics.setSphereCount(count);
    });
  });

  // Gravity Mode Toggles
  const gravityBtns = document.querySelectorAll('[data-hud-gravity]');
  gravityBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      gravityBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const gType = btn.dataset.hudGravity;
      if (physics) physics.setGravityType(gType);
    });
  });

  // Restitution Slider
  const restitutionSlider = document.getElementById('hud-restitution');
  const restitutionVal = document.getElementById('hud-restitution-val');
  if (restitutionSlider && physics) {
    restitutionSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (restitutionVal) restitutionVal.textContent = val.toFixed(2);
      physics.setRestitution(val);
    });
  }

  // Material Theme Toggles
  const materialBtns = document.querySelectorAll('[data-hud-material]');
  materialBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      materialBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.dataset.hudMaterial;
      if (physics) physics.setMaterialTheme(theme);
    });
  });

  // Mouse Force Mode Toggles
  const mouseModeBtns = document.querySelectorAll('[data-hud-mouse-mode]');
  mouseModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      mouseModeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.hudMouseMode;
      if (physics) physics.setMouseForceMode(mode);
    });
  });

  // Mouse Force Radius Slider
  const mouseRadiusSlider = document.getElementById('hud-mouse-radius');
  const mouseRadiusVal = document.getElementById('hud-mouse-radius-val');
  if (mouseRadiusSlider && physics) {
    mouseRadiusSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (mouseRadiusVal) mouseRadiusVal.textContent = val.toFixed(1);
      physics.setMouseRadius(val);
    });
  }

  // Camera Parallax Toggle
  const cameraParallaxBtn = document.getElementById('hud-camera-parallax');
  let parallaxActive = true;
  if (cameraParallaxBtn && physics) {
    cameraParallaxBtn.addEventListener('click', () => {
      parallaxActive = !parallaxActive;
      cameraParallaxBtn.classList.toggle('active', parallaxActive);
      cameraParallaxBtn.textContent = parallaxActive ? 'ON' : 'OFF';
      physics.toggleCameraParallax(parallaxActive);
    });
  }

  // =========================================================================
  // 3. Project Detail Modal / Case Study Overlay
  // =========================================================================
  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalMedia = document.getElementById('modal-media');
  const modalDesc = document.getElementById('modal-desc');

  const projectDossiers = {
    sync: {
      title: 'sync // KXBTC15M — Quantitative Microstructure Trading Architecture',
      subtitle: 'Kalshi 15-Minute Bitcoin Binary Prediction Engine · Closed-Form Microstructure',
      image: 'assets/screenshots/sync.png',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Rejects curve-fit multi-strategy ensembles in favor of closed-form microstructure pricing: Synthetic BRTI Lead-Lag Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage, sub-millisecond execution routing, and SHA-256 tamper-evident cryptographic trade logging.'
    },
    pixellabz: {
      title: 'PixelLabz Global RPC Mesh — Multi-Region Infrastructure',
      subtitle: 'Non-Consensus Bare-Metal Node Fabric on Solana & Aptos · 8M+ Transactions',
      image: 'assets/screenshots/pixellabz.png',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Purpose-built non-consensus Solana RPC network spanning 15+ bare-metal servers across the U.S., Germany, and Singapore with 1,000 RPS sustained throughput and 0s same-block landing.'
    },
    nodestop: {
      title: 'NodeStop Enterprise Security Infrastructure',
      subtitle: 'Information Security Analyst Intern — Threat Hunting & Deep Packet Telemetry',
      image: 'assets/screenshots/fig-05-telemetry-pipeline.svg',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Conducted enterprise vulnerability assessments, risk analyses, and real-time network traffic monitoring using Snort IDS and Wireshark.'
    }
  };

  function openProjectModal(projectId) {
    const data = projectDossiers[projectId];
    if (!data || !modal) return;

    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;
    modalDesc.textContent = data.desc;

    if (data.image) {
      modalMedia.style.display = 'flex';
      modalMedia.innerHTML = `<img src="${data.image}" alt="${data.title}" loading="lazy" />`;
    } else {
      modalMedia.style.display = 'none';
      modalMedia.innerHTML = '';
    }

    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!modal) return;
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-project]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.openProject;
      openProjectModal(projectId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
      closeProjectModal();
    }
  });

  // =========================================================================
  // 4. Live Eastern Time Star-Clock
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
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      liveClock.textContent = `${h}:${m}:${s} EDT`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
});
