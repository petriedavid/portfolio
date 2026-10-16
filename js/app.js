/**
 * LIQUID GLASS BACKGROUND & MODAL CONTROLLER
 * Features:
 * - Viscous mouse cursor light trail with inertial lerp physics
 * - Project modal inspector for "sync // KXBTC15M" and "PixelLabz"
 * - Live EDT clock
 */

document.addEventListener('DOMContentLoaded', () => {
  const cursorGlow = document.getElementById('cursor-glow');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMedia = document.getElementById('lightbox-media');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const liveClock = document.getElementById('live-clock');

  // =========================================================================
  // 1. Viscous Ambient Mouse Cursor Light Trail (VisionOS Glass Refraction)
  // =========================================================================
  if (cursorGlow) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        cursorGlow.style.opacity = '1';
      }
    });

    window.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
    });

    // Inertial lerp loop for viscous fluid motion
    function animateCursorGlow() {
      // 0.085 damping factor gives that luxurious, viscous fluid feel
      currentX += (mouseX - currentX) * 0.085;
      currentY += (mouseY - currentY) * 0.085;

      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;

      requestAnimationFrame(animateCursorGlow);
    }
    requestAnimationFrame(animateCursorGlow);
  }

  // =========================================================================
  // 2. Project Modal Inspector ("sync" & "PixelLabz")
  // =========================================================================
  const projects = [
    {
      id: 'sync',
      title: 'sync // KXBTC15M (Institutional Kalshi 15-Minute Bitcoin Binary Quantitative Architecture)',
      image: 'assets/screenshots/sync.png',
      desc: 'Deterministic market-microstructure trading bot and telemetry dashboard purpose-built for Kalshi’s KXBTC15M prediction markets. Employs Synthetic BRTI Lead-Lag Replication across Coinbase, Kraken, and Bitstamp with 60-Second Settlement TWAP Pinning Arbitrage, sub-millisecond order routing, and cryptographic trade logging.'
    },
    {
      id: 'pixellabz',
      title: 'PixelLabz // High-Performance Solana RPC Infrastructure',
      image: 'assets/screenshots/pixellabz.png',
      desc: 'Purpose-built non-consensus Solana RPC network spanning 15+ bare-metal servers across the U.S., Germany, and Singapore. Features 1,000 RPS limit per node, 0s landing time with same-block transaction inclusion, full Geyser / Yellowstone real-time streaming plugin support, and IP-whitelisted endpoint security. Validated across 8M+ transactions maintaining 99.99% uptime for 4,000+ active users with ~$180,000 in platform revenue.'
    }
  ];

  function openLightbox(project) {
    if (!project) return;
    lightboxTitle.textContent = project.title;
    lightboxDesc.textContent = project.desc;
    lightboxMedia.innerHTML = `
      <img src="${project.image}" alt="${project.title}" style="max-width: 100%; max-height: 65vh; object-fit: contain;" />
    `;
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  // Open modal on click
  document.querySelectorAll('.btn-inspect, .project-image-slot').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.closest('.project-card');
      if (card) {
        const id = card.dataset.projectId;
        const project = projects.find(p => p.id === id);
        if (project) openLightbox(project);
      }
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
      closeLightbox();
    }
  });

  // =========================================================================
  // 3. Live EDT Clock
  // =========================================================================
  function updateClock() {
    if (!liveClock) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    liveClock.textContent = `${hours}:${minutes}:${seconds} EDT`;
  }
  updateClock();
  setInterval(updateClock, 1000);
});
