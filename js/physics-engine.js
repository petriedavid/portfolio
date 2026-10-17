/**
 * THREE.JS INTERACTIVE 3D SPHERE PHYSICS ENGINE
 * Inspired by Shiyun Lu (shiyunlu.com)
 * 
 * Features:
 * - 60 FPS Verlet integration physics simulation with sphere-sphere collisions
 * - Dynamic 3D viewport boundary reflection calculated from camera frustum
 * - 3D Raycaster cursor force field (Repulsion, Attraction, Vortex)
 * - Click radial impulse shockwave & sphere dragging
 * - Subtle camera parallax tracking mouse coordinates
 * - Live HUD parameter hooks (Gravity, Sphere Count, Restitution, Force Mode, Materials)
 * - Automatic window resize boundary recalculation & mobile optimization
 */

import * as THREE from './vendor/three.module.js';

export class PhysicsCanvas {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = Object.assign({
      sphereCount: window.innerWidth < 768 ? 18 : 34,
      gravity: 0, // 0 = zero-g, >0 = downward, <0 = upward
      gravityType: 'none', // 'none', 'down', 'up', 'center'
      restitution: 0.92, // bounciness (elasticity)
      mouseForceMode: 'repel', // 'repel', 'attract', 'vortex'
      mouseRadius: 6.5,
      mouseStrength: 0.85,
      materialTheme: 'obsidian', // 'obsidian', 'chrome', 'studio'
      cameraParallax: true
    }, options);

    this.spheres = [];
    this.collisionPairs = [];
    this.isDragging = false;
    this.draggedSphere = null;
    this.mouse2D = new THREE.Vector2(-9999, -9999);
    this.mouse3D = new THREE.Vector3(0, 0, 0);
    this.targetCameraPos = new THREE.Vector3(0, 0, 18);
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.planeIntersectPoint = new THREE.Vector3();
    this.clock = new THREE.Clock();
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.isRunning = true;
    this.rafId = null;

    this.initScene();
    this.initLighting();
    this.initMaterials();
    this.spawnSpheres(this.options.sphereCount);
    this.initEventListeners();
    this.updateFrustumBounds();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08090C);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 18);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.canvas = this.renderer.domElement;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '1';
    this.container.appendChild(this.canvas);
  }

  initLighting() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Primary Key Light (Top-Right Front)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(12, 16, 14);
    this.scene.add(this.keyLight);

    // Secondary Fill Light (Left Front)
    this.fillLight = new THREE.DirectionalLight(0x70E1FF, 1.2);
    this.fillLight.position.set(-14, -8, 10);
    this.scene.add(this.fillLight);

    // Subtle Prismatic Rim Light (Bottom Back)
    this.rimLight = new THREE.DirectionalLight(0xA390E4, 1.4);
    this.rimLight.position.set(0, -12, -8);
    this.scene.add(this.rimLight);
  }

  initMaterials() {
    this.materials = {
      // Deep obsidian metallic with specular bevel reflection
      obsidianPrimary: new THREE.MeshStandardMaterial({
        color: 0x12141A,
        metalness: 0.92,
        roughness: 0.14
      }),
      obsidianSecondary: new THREE.MeshStandardMaterial({
        color: 0x1E222B,
        metalness: 0.88,
        roughness: 0.22
      }),
      // Titanium Chrome Sphere
      chrome: new THREE.MeshStandardMaterial({
        color: 0xDCE0E8,
        metalness: 0.96,
        roughness: 0.08
      }),
      // Prismatic Pearl White Sphere
      pearl: new THREE.MeshStandardMaterial({
        color: 0xF4F6FA,
        metalness: 0.35,
        roughness: 0.28
      }),
      // Minimal Signal Accent Sphere
      signal: new THREE.MeshStandardMaterial({
        color: 0x3B82F6,
        metalness: 0.75,
        roughness: 0.18
      })
    };
  }

  getMaterialForSphere(index) {
    const theme = this.options.materialTheme;
    if (theme === 'chrome') {
      return index % 5 === 0 ? this.materials.signal : this.materials.chrome;
    } else if (theme === 'studio') {
      return index % 4 === 0 ? this.materials.chrome : this.materials.pearl;
    } else {
      // Obsidian theme (default)
      if (index % 6 === 0) return this.materials.signal;
      if (index % 3 === 0) return this.materials.chrome;
      if (index % 2 === 0) return this.materials.obsidianSecondary;
      return this.materials.obsidianPrimary;
    }
  }

  spawnSpheres(count) {
    // Remove existing spheres
    this.spheres.forEach(s => {
      this.scene.remove(s.mesh);
      if (s.mesh.geometry) s.mesh.geometry.dispose();
    });
    this.spheres = [];

    const baseGeom = new THREE.SphereGeometry(1, 32, 32);

    for (let i = 0; i < count; i++) {
      // Vary radius between 0.65 and 1.6 for natural organic variety
      const radius = THREE.MathUtils.randFloat(0.65, 1.55);
      const mass = radius * radius * radius;

      const material = this.getMaterialForSphere(i);
      const mesh = new THREE.Mesh(baseGeom, material);
      mesh.scale.setScalar(radius);

      // Random initial position within bounds
      const spreadX = 7;
      const spreadY = 4.5;
      mesh.position.set(
        THREE.MathUtils.randFloat(-spreadX, spreadX),
        THREE.MathUtils.randFloat(-spreadY, spreadY),
        THREE.MathUtils.randFloat(-3, 3)
      );

      this.scene.add(mesh);

      this.spheres.push({
        id: i,
        mesh: mesh,
        radius: radius,
        mass: mass,
        pos: mesh.position.clone(),
        prevPos: mesh.position.clone().sub(
          new THREE.Vector3(
            THREE.MathUtils.randFloat(-0.04, 0.04),
            THREE.MathUtils.randFloat(-0.04, 0.04),
            THREE.MathUtils.randFloat(-0.02, 0.02)
          )
        ),
        vel: new THREE.Vector3(),
        acc: new THREE.Vector3()
      });
    }
  }

  updateFrustumBounds() {
    const vFOV = THREE.MathUtils.degToRad(this.camera.fov);
    const distance = this.camera.position.z;
    const height = 2 * Math.tan(vFOV / 2) * distance;
    const width = height * this.camera.aspect;

    this.bounds = {
      halfW: width / 2,
      halfH: height / 2,
      depthMin: -4.5,
      depthMax: 4.5
    };
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse / Pointer Tracking
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });
    window.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointerup', () => this.onPointerUp());
    window.addEventListener('pointercancel', () => this.onPointerUp());

    // Touch support for mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.onMouseMove(e.touches[0]);
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isRunning = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
      } else {
        this.isRunning = true;
        this.clock.start();
        this.animate();
      }
    });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.updateFrustumBounds();
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast onto z = 0 plane to get 3D mouse position
    this.raycaster.setFromCamera(this.mouse2D, this.camera);
    if (this.raycaster.ray.intersectPlane(this.plane, this.planeIntersectPoint)) {
      this.mouse3D.copy(this.planeIntersectPoint);
    }

    // Camera Parallax target
    if (this.options.cameraParallax) {
      this.targetCameraPos.x = this.mouse2D.x * 1.4;
      this.targetCameraPos.y = this.mouse2D.y * 0.9;
    }
  }

  onPointerDown(e) {
    // Check if clicked element is an interactive link/button in UI
    if (e.target.closest('a, button, input, select, textarea, .interactive-click')) {
      return;
    }

    this.onMouseMove(e);
    this.raycaster.setFromCamera(this.mouse2D, this.camera);

    // Check if user clicked directly on a sphere to drag
    const sphereMeshes = this.spheres.map(s => s.mesh);
    const intersects = this.raycaster.intersectObjects(sphereMeshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const foundSphere = this.spheres.find(s => s.mesh === hitMesh);
      if (foundSphere) {
        this.isDragging = true;
        this.draggedSphere = foundSphere;
        return;
      }
    }

    // Radial impulse shockwave on click
    this.triggerShockwave(this.mouse3D, 2.8);
  }

  onPointerUp() {
    this.isDragging = false;
    this.draggedSphere = null;
  }

  triggerShockwave(epicenter, power = 2.5) {
    this.spheres.forEach(sphere => {
      const diff = sphere.pos.clone().sub(epicenter);
      const dist = diff.length();
      if (dist < 10 && dist > 0.1) {
        const force = (1 - dist / 10) * power;
        diff.normalize().multiplyScalar(force);
        sphere.vel.add(diff);
      }
    });
  }

  applyForces() {
    const gravityType = this.options.gravityType;
    const mouseRadius = this.options.mouseRadius;
    const mouseStrength = this.options.mouseStrength;
    const forceMode = this.options.mouseForceMode;

    this.spheres.forEach(sphere => {
      // Reset acceleration
      sphere.acc.set(0, 0, 0);

      // 1. Gravity Forces
      if (gravityType === 'down') {
        sphere.acc.y -= 0.009;
      } else if (gravityType === 'up') {
        sphere.acc.y += 0.009;
      } else if (gravityType === 'center') {
        const toCenter = sphere.pos.clone().negate().normalize().multiplyScalar(0.006);
        sphere.acc.add(toCenter);
      }

      // 2. Dragged Sphere Position Tracking
      if (this.isDragging && this.draggedSphere === sphere) {
        sphere.pos.lerp(this.mouse3D, 0.35);
        sphere.vel.set(0, 0, 0);
        return;
      }

      // 3. Mouse Cursor 3D Force Field
      const diff = sphere.pos.clone().sub(this.mouse3D);
      const dist = diff.length();

      if (dist < mouseRadius && dist > 0.1) {
        const intensity = (1 - dist / mouseRadius) * (mouseStrength * 0.045);

        if (forceMode === 'repel') {
          // Push spheres outward
          diff.normalize().multiplyScalar(intensity);
          sphere.acc.add(diff);
        } else if (forceMode === 'attract') {
          // Pull spheres towards cursor
          diff.normalize().multiplyScalar(-intensity);
          sphere.acc.add(diff);
        } else if (forceMode === 'vortex') {
          // Swirl spheres tangentially
          const tangent = new THREE.Vector3(-diff.y, diff.x, 0).normalize().multiplyScalar(intensity * 1.2);
          sphere.acc.add(tangent);
        }
      }
    });
  }

  solveCollisions() {
    const restitution = this.options.restitution;
    const count = this.spheres.length;

    // Sphere-Sphere Elastic Collisions
    for (let i = 0; i < count; i++) {
      const s1 = this.spheres[i];

      for (let j = i + 1; j < count; j++) {
        const s2 = this.spheres[j];

        const dx = s2.pos.x - s1.pos.x;
        const dy = s2.pos.y - s1.pos.y;
        const dz = s2.pos.z - s1.pos.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const minDist = s1.radius + s2.radius;

        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          const overlap = (minDist - dist) * 0.5;

          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;

          // Separate positions
          s1.pos.x -= nx * overlap;
          s1.pos.y -= ny * overlap;
          s1.pos.z -= nz * overlap;

          s2.pos.x += nx * overlap;
          s2.pos.y += ny * overlap;
          s2.pos.z += nz * overlap;

          // Elastic collision momentum exchange
          const kx = s1.vel.x - s2.vel.x;
          const ky = s1.vel.y - s2.vel.y;
          const kz = s1.vel.z - s2.vel.z;
          const p = 2 * (nx * kx + ny * ky + nz * kz) / (s1.mass + s2.mass);

          s1.vel.x -= p * s2.mass * nx * restitution;
          s1.vel.y -= p * s2.mass * ny * restitution;
          s1.vel.z -= p * s2.mass * nz * restitution;

          s2.vel.x += p * s1.mass * nx * restitution;
          s2.vel.y += p * s1.mass * ny * restitution;
          s2.vel.z += p * s1.mass * nz * restitution;
        }
      }
    }

    // Viewport Boundary Reflection
    const b = this.bounds;
    this.spheres.forEach(s => {
      const r = s.radius;

      // X boundaries (left/right)
      if (s.pos.x - r < -b.halfW) {
        s.pos.x = -b.halfW + r;
        s.vel.x = -s.vel.x * restitution;
      } else if (s.pos.x + r > b.halfW) {
        s.pos.x = b.halfW - r;
        s.vel.x = -s.vel.x * restitution;
      }

      // Y boundaries (bottom/top)
      if (s.pos.y - r < -b.halfH) {
        s.pos.y = -b.halfH + r;
        s.vel.y = -s.vel.y * restitution;
      } else if (s.pos.y + r > b.halfH) {
        s.pos.y = b.halfH - r;
        s.vel.y = -s.vel.y * restitution;
      }

      // Z boundaries (depth)
      if (s.pos.z - r < b.depthMin) {
        s.pos.z = b.depthMin + r;
        s.vel.z = -s.vel.z * restitution;
      } else if (s.pos.z + r > b.depthMax) {
        s.pos.z = b.depthMax - r;
        s.vel.z = -s.vel.z * restitution;
      }
    });
  }

  updatePhysics(dt) {
    const damping = 0.985; // Viscous velocity decay

    this.applyForces();

    // Verlet integration step
    this.spheres.forEach(s => {
      if (this.isDragging && this.draggedSphere === s) return;

      s.vel.add(s.acc);
      s.vel.multiplyScalar(damping);
      s.pos.add(s.vel);
    });

    this.solveCollisions();

    // Update Three.js meshes
    this.spheres.forEach(s => {
      s.mesh.position.copy(s.pos);
    });
  }

  updateCamera() {
    if (this.options.cameraParallax) {
      this.camera.position.x += (this.targetCameraPos.x - this.camera.position.x) * 0.05;
      this.camera.position.y += (this.targetCameraPos.y - this.camera.position.y) * 0.05;
      this.camera.lookAt(0, 0, 0);
    }
  }

  updateFps(now) {
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      if (this.onFpsUpdate) this.onFpsUpdate(this.fps);
    }
  }

  animate() {
    if (!this.isRunning) return;

    const dt = Math.min(this.clock.getDelta(), 0.033);
    const now = performance.now();

    this.updatePhysics(dt);
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
    this.updateFps(now);

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  // =========================================================================
  // Live HUD Controller APIs
  // =========================================================================
  setSphereCount(count) {
    this.options.sphereCount = count;
    this.spawnSpheres(count);
  }

  setGravityType(type) {
    this.options.gravityType = type;
  }

  setRestitution(val) {
    this.options.restitution = val;
  }

  setMouseForceMode(mode) {
    this.options.mouseForceMode = mode;
  }

  setMouseRadius(radius) {
    this.options.mouseRadius = radius;
  }

  setMouseStrength(strength) {
    this.options.mouseStrength = strength;
  }

  setMaterialTheme(theme) {
    this.options.materialTheme = theme;
    this.spheres.forEach((s, idx) => {
      s.mesh.material = this.getMaterialForSphere(idx);
    });
  }

  toggleCameraParallax(enabled) {
    this.options.cameraParallax = enabled;
    if (!enabled) {
      this.targetCameraPos.set(0, 0, 18);
    }
  }

  resetScene() {
    this.spawnSpheres(this.options.sphereCount);
    this.targetCameraPos.set(0, 0, 18);
    this.camera.position.set(0, 0, 18);
    this.camera.lookAt(0, 0, 0);
  }

  scatterSpheres() {
    this.spheres.forEach(s => {
      s.vel.set(
        THREE.MathUtils.randFloat(-0.6, 0.6),
        THREE.MathUtils.randFloat(-0.6, 0.6),
        THREE.MathUtils.randFloat(-0.4, 0.4)
      );
    });
  }
}
