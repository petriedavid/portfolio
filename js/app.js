/**
 * PORTFOLIO APPLICATION CONTROLLER
 * Minimalist Shiyun Lu Inspired Architecture
 * 
 * Orchestrates:
 * - Interactive 3D Boba Ball Pit Physics Canvas (Three.js)
 * - Corner navigation drawer overlay (Work, About, Contact)
 * - Subtle inline debug toggles (// Camera, // Mouse, // Spheres)
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
      sphereCount: window.innerWidth < 768 ? 32 : 56,
      gravity: -26.0,
      restitution: 0.78,
      mouseRadius: 2.3,
      shadows: true
    });
  }

  // =========================================================================
  // 2. Corner Navigation Menu Drawer (Work, About, Contact)
  // =========================================================================
  const menuBtn = document.getElementById('menu-btn');
  const menuCloseBtn = document.getElementById('menu-close-btn');
  const menuDrawer = document.getElementById('menu-drawer');

  function openMenu() {
    if (!menuDrawer) return;
    menuDrawer.classList.add('is-open');
    menuDrawer.setAttribute('aria-hidden', 'false');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!menuDrawer) return;
    menuDrawer.classList.remove('is-open');
    menuDrawer.setAttribute('aria-hidden', 'true');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMenu();
    });
  }

  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  // Close when clicking drawer backdrop (outside panel)
  if (menuDrawer) {
    menuDrawer.addEventListener('click', (e) => {
      if (e.target === menuDrawer) {
        closeMenu();
      }
    });
  }

  // Close with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuDrawer && menuDrawer.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // =========================================================================
  // 3. Subtle Inline Debug Toggles (// Camera, // Mouse, // Spheres)
  // =========================================================================
  const toggleCameraBtn = document.getElementById('toggle-camera');
  const toggleMouseBtn = document.getElementById('toggle-mouse');
  const toggleSpheresBtn = document.getElementById('toggle-spheres');

  // Both Camera and Mouse auto on by default
  if (toggleCameraBtn && physics) {
    toggleCameraBtn.classList.toggle('is-active', physics.cameraTilted);
  }
  if (toggleMouseBtn && physics) {
    toggleMouseBtn.classList.toggle('is-active', physics.showMouseCollider);
  }

  if (toggleCameraBtn && physics) {
    toggleCameraBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isTilted = physics.toggleCameraAngle();
      toggleCameraBtn.classList.toggle('is-active', isTilted);
    });
  }

  if (toggleMouseBtn && physics) {
    toggleMouseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = physics.toggleMouseColliderVisibility();
      toggleMouseBtn.classList.toggle('is-active', isVisible);
    });
  }

  if (toggleSpheresBtn && physics) {
    toggleSpheresBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      physics.resetCascade();
      toggleSpheresBtn.classList.add('is-active');
      setTimeout(() => toggleSpheresBtn.classList.remove('is-active'), 400);
    });
  }
});
