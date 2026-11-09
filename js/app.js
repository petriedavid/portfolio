/**
 * PORTFOLIO APPLICATION CONTROLLER
 *
 * The menu is wired up first and has no dependency on Three.js, so the content stays
 * reachable on slow connections, without WebGL, and with reduced motion enabled.
 * The ball pit is loaded afterwards as an enhancement.
 */

const menuBtn = document.getElementById('menu-btn');
const menuCloseBtn = document.getElementById('menu-close-btn');
const menuDrawer = document.getElementById('menu-drawer');
const uiLayer = document.getElementById('ui-layer');

let physics = null;
let menuTrigger = menuBtn;

// =========================================================================
// 1. Full-Screen Menu
// =========================================================================
function isMenuOpen() {
  return menuDrawer.classList.contains('is-open');
}

function openMenu(trigger = menuBtn, sectionId = null) {
  menuTrigger = trigger;
  menuDrawer.classList.add('is-open');
  menuDrawer.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true');
  uiLayer.inert = true;
  physics?.setPaused(true);

  const section = sectionId ? document.getElementById(sectionId) : null;
  if (section) {
    section.scrollIntoView();
  } else {
    menuDrawer.scrollTop = 0;
  }
  menuCloseBtn.focus({ preventScroll: true });
}

function closeMenu() {
  menuDrawer.classList.remove('is-open');
  menuDrawer.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
  uiLayer.inert = false;
  physics?.setPaused(false);
  menuTrigger.focus({ preventScroll: true });
}

menuBtn.addEventListener('click', () => openMenu(menuBtn));
menuCloseBtn.addEventListener('click', closeMenu);

document.querySelectorAll('[data-open-menu]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    openMenu(link, link.dataset.openMenu);
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isMenuOpen()) {
    closeMenu();
  }
});

// Lets davelabs.me/#work open straight to the projects.
if (window.location.hash === '#work') {
  openMenu(menuBtn, 'work');
}

// =========================================================================
// 2. Interactive Ball Pit (Optional Enhancement)
// =========================================================================
async function startBallPit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  try {
    const { PhysicsCanvas } = await import('./physics-engine.js');
    physics = new PhysicsCanvas(document.getElementById('canvas-container'), {
      gravity: -26.0,
      restitution: 0.78,
      mouseRadius: 2.3,
      shadows: true
    });
    physics.setPaused(isMenuOpen());
    document.documentElement.classList.add('has-canvas');
  } catch (error) {
    console.warn('Ball pit unavailable, continuing without it:', error);
  }
}

startBallPit();
