/**
 * THREE.JS BOBA / BALL PIT PHYSICS ENGINE
 * Inspired by Shiyun Lu (shiyunlu.com)
 * 
 * Features:
 * - Real downward gravity (-Y) with camera-frustum floor and wall boundaries
 * - Snappy sphere-to-sphere collision & impulse resolution
 * - Tactile MeshPhysicalMaterial boba pearls with clearcoat and soft contact shadows
 * - Kinematic mouse ball collider that physically plows through settled spheres
 * - Subtle inline debug toggles: // Camera, // Mouse, // Spheres
 * - Responsive boundary recalculation and mobile auto-scaling
 */

import * as THREE from './vendor/three.module.js';

export class PhysicsCanvas {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = Object.assign({
      sphereCount: window.innerWidth < 768 ? 32 : 56,
      gravity: -26.0,
      restitution: 0.78,
      mouseRadius: 2.3,
      shadows: true
    }, options);

    this.spheres = [];
    this.mouse2D = new THREE.Vector2(-9999, -9999);
    this.mouse3D = new THREE.Vector3(0, -999, 0);
    this.prevMouse3D = new THREE.Vector3(0, -999, 0);
    this.mouseVel = new THREE.Vector3(0, 0, 0);
    this.mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.raycaster = new THREE.Raycaster();
    this.planeIntersectPoint = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.isRunning = true;
    this.rafId = null;

    // Debug / State Toggles (Auto ON by default)
    this.showMouseCollider = true;
    this.cameraTilted = true;
    this.targetCameraPos = new THREE.Vector3(2.0, 3.2, 21.0);
    this.targetCameraLook = new THREE.Vector3(0, -1.5, 0);

    this.initScene();
    this.initLighting();
    this.initMaterials();
    this.initFloorShadowPlane();
    this.initMouseHelper();
    this.updateFrustumBounds();
    this.spawnSpheres(this.options.sphereCount);
    this.initEventListeners();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF4F1EA);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.copy(this.targetCameraPos);
    this.camera.lookAt(this.targetCameraLook);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    if (this.options.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

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
    // Soft studio hemisphere ambient fill
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xE2DDD5, 0.85);
    this.scene.add(hemiLight);

    // Primary Studio Key Light (Directional with soft shadows)
    this.keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    this.keyLight.position.set(10, 18, 14);
    if (this.options.shadows) {
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 1;
      this.keyLight.shadow.camera.far = 40;
      this.keyLight.shadow.camera.left = -16;
      this.keyLight.shadow.camera.right = 16;
      this.keyLight.shadow.camera.top = 16;
      this.keyLight.shadow.camera.bottom = -16;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.radius = 3;
    }
    this.scene.add(this.keyLight);

    // Soft Front Fill Light
    this.fillLight = new THREE.DirectionalLight(0xF4F0EB, 0.9);
    this.fillLight.position.set(-12, 6, 12);
    this.scene.add(this.fillLight);
  }

  initMaterials() {
    // Tactile glossy black boba pearl material
    this.bobaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x121316,
      roughness: 0.12,
      metalness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9
    });

    // Sleek graphite / slate accent material
    this.graphiteMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2E3038,
      roughness: 0.18,
      metalness: 0.12,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });

    // Chrome pearl accent material
    this.chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xE8EAF0,
      roughness: 0.08,
      metalness: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04
    });
  }

  initFloorShadowPlane() {
    const shadowGeo = new THREE.PlaneGeometry(60, 40);
    const shadowMat = new THREE.ShadowMaterial({
      opacity: 0.12
    });
    this.floorShadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.floorShadowPlane.rotation.x = -Math.PI / 2;
    this.floorShadowPlane.position.y = -8;
    this.floorShadowPlane.receiveShadow = true;
    this.scene.add(this.floorShadowPlane);
  }

  initMouseHelper() {
    // Sleek reticle indicator for // Mouse toggle
    const helperGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(this.options.mouseRadius - 0.035, this.options.mouseRadius, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x111215,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    helperGroup.add(ring);

    const dotGeo = new THREE.CircleGeometry(0.12, 16);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0x111215,
      transparent: true,
      opacity: 0.45
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    helperGroup.add(dot);

    this.mouseHelper = helperGroup;
    this.mouseHelper.position.set(0, -999, 0);
    this.mouseHelper.visible = this.showMouseCollider;
    this.scene.add(this.mouseHelper);
  }

  updateFrustumBounds() {
    const vFOV = THREE.MathUtils.degToRad(this.camera.fov);
    const distance = 20; // nominal camera distance to z = 0
    const height = 2 * Math.tan(vFOV / 2) * distance;
    const width = height * this.camera.aspect;

    this.bounds = {
      halfW: width / 2,
      halfH: height / 2,
      floorY: -height / 2,
      depthMin: -2.4,
      depthMax: 2.4
    };

    if (this.floorShadowPlane) {
      this.floorShadowPlane.position.y = this.bounds.floorY;
    }
  }

  spawnSpheres(count) {
    this.spheres.forEach(s => {
      this.scene.remove(s.mesh);
      if (s.mesh.geometry) s.mesh.geometry.dispose();
    });
    this.spheres = [];

    const baseGeom = new THREE.SphereGeometry(1, 32, 32);

    for (let i = 0; i < count; i++) {
      // Natural boba radius variety between 0.75 and 1.28
      const radius = THREE.MathUtils.randFloat(0.75, 1.28);
      const mass = radius * radius * radius;

      let material = this.bobaMaterial;
      if (i % 7 === 0) material = this.chromeMaterial;
      else if (i % 3 === 0) material = this.graphiteMaterial;

      const mesh = new THREE.Mesh(baseGeom, material);
      mesh.scale.setScalar(radius);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Initial placement: spread across upper and middle viewport to tumble in
      const startX = THREE.MathUtils.randFloat(-this.bounds.halfW * 0.85, this.bounds.halfW * 0.85);
      const startY = THREE.MathUtils.randFloat(-this.bounds.halfH * 0.2, this.bounds.halfH * 1.2);
      const startZ = THREE.MathUtils.randFloat(-1.2, 1.2);

      mesh.position.set(startX, startY, startZ);
      this.scene.add(mesh);

      this.spheres.push({
        id: i,
        mesh: mesh,
        radius: radius,
        mass: mass,
        pos: mesh.position.clone(),
        vel: new THREE.Vector3(
          THREE.MathUtils.randFloat(-0.8, 0.8),
          THREE.MathUtils.randFloat(-1.5, 0.5),
          THREE.MathUtils.randFloat(-0.4, 0.4)
        ),
        isSettled: false
      });
    }
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse / Pointer Tracking
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });
    window.addEventListener('pointerdown', (e) => this.onPointerDown(e));

    // Touch support for mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.onMouseMove(e.touches[0]);
      }
    }, { passive: true });

    window.addEventListener('touchstart', (e) => {
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

    this.raycaster.setFromCamera(this.mouse2D, this.camera);
    if (this.raycaster.ray.intersectPlane(this.mousePlane, this.planeIntersectPoint)) {
      this.mouse3D.copy(this.planeIntersectPoint);
      if (this.mouseHelper) {
        this.mouseHelper.position.copy(this.mouse3D);
        this.mouseHelper.position.z += 0.05;
      }
    }
  }

  onPointerDown(e) {
    // If user clicked an interactive UI link or button, skip physics impulse
    if (e.target.closest('a, button, input, select, textarea, .menu-drawer, #menu-btn')) {
      return;
    }

    this.onMouseMove(e);

    // Pop impulse: pop nearby settled balls upward
    let popped = 0;
    this.spheres.forEach(s => {
      const dist = s.pos.distanceTo(this.mouse3D);
      if (dist < 6.5) {
        const factor = 1 - dist / 6.5;
        s.vel.y += 14.0 * factor + 4.0;
        s.vel.x += (s.pos.x - this.mouse3D.x) * 3.0 * factor;
        s.isSettled = false;
        popped++;
      }
    });

    // If clicking in clear air, spawn a small burst of new boba pearls
    if (popped < 3 && this.spheres.length < 80) {
      this.spawnBurst(3, this.mouse3D.x);
    }
  }

  spawnBurst(count, atX) {
    const baseGeom = new THREE.SphereGeometry(1, 32, 32);
    for (let i = 0; i < count; i++) {
      const radius = THREE.MathUtils.randFloat(0.8, 1.25);
      const mass = radius * radius * radius;
      const mesh = new THREE.Mesh(baseGeom, i % 2 === 0 ? this.bobaMaterial : this.graphiteMaterial);
      mesh.scale.setScalar(radius);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const x = THREE.MathUtils.clamp(atX + THREE.MathUtils.randFloat(-1.2, 1.2), -this.bounds.halfW + 1, this.bounds.halfW - 1);
      const y = this.bounds.halfH + THREE.MathUtils.randFloat(1, 3);
      mesh.position.set(x, y, THREE.MathUtils.randFloat(-0.8, 0.8));
      this.scene.add(mesh);

      this.spheres.push({
        id: this.spheres.length,
        mesh: mesh,
        radius: radius,
        mass: mass,
        pos: mesh.position.clone(),
        vel: new THREE.Vector3(
          THREE.MathUtils.randFloat(-1, 1),
          THREE.MathUtils.randFloat(-6, -2),
          THREE.MathUtils.randFloat(-0.4, 0.4)
        ),
        isSettled: false
      });
    }
  }

  // =========================================================================
  // Physics Simulation Step
  // =========================================================================
  updatePhysics(dt) {
    const cappedDt = Math.min(dt, 0.033);
    const gravity = this.options.gravity;
    const restitution = this.options.restitution;
    const mouseRadius = this.options.mouseRadius;

    // Calculate mouse velocity for kinematic impulse transfer
    this.mouseVel.copy(this.mouse3D).sub(this.prevMouse3D).divideScalar(cappedDt || 0.016);
    this.mouseVel.clampLength(0, 45); // Clamp maximum mouse velocity
    this.prevMouse3D.copy(this.mouse3D);

    const subSteps = 3;
    const sdt = cappedDt / subSteps;

    for (let step = 0; step < subSteps; step++) {
      // 1. Integrate Gravity & Velocity
      this.spheres.forEach(s => {
        // Downward gravity
        s.vel.y += gravity * sdt;

        // Position update
        s.pos.addScaledVector(s.vel, sdt);
      });

      // 2. Kinematic Mouse Ball Collider (Direct "Plow through" collision)
      if (this.mouse3D.y > -900) {
        this.spheres.forEach(s => {
          const dx = s.pos.x - this.mouse3D.x;
          const dy = s.pos.y - this.mouse3D.y;
          const dz = s.pos.z - this.mouse3D.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          const minDist = s.radius + mouseRadius;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.001;
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;

            // Push sphere out of the mouse collider immediately
            const pushDist = minDist - dist;
            s.pos.x += nx * pushDist;
            s.pos.y += ny * pushDist;
            s.pos.z += nz * pushDist;

            // Transfer velocity from cursor motion and radial displacement
            const plowPower = 4.2;
            s.vel.x += nx * plowPower + this.mouseVel.x * 0.45;
            s.vel.y += ny * plowPower + Math.max(0, this.mouseVel.y * 0.45);
            s.vel.z += nz * plowPower;
            s.isSettled = false;
          }
        });
      }

      // 3. Sphere-Sphere Snappy Impulse Collisions
      const count = this.spheres.length;
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

            // Separate overlapping positions
            s1.pos.x -= nx * overlap;
            s1.pos.y -= ny * overlap;
            s1.pos.z -= nz * overlap;

            s2.pos.x += nx * overlap;
            s2.pos.y += ny * overlap;
            s2.pos.z += nz * overlap;

            // Elastic impulse calculation
            const relVx = s1.vel.x - s2.vel.x;
            const relVy = s1.vel.y - s2.vel.y;
            const relVz = s1.vel.z - s2.vel.z;
            const velAlongNormal = relVx * nx + relVy * ny + relVz * nz;

            if (velAlongNormal > 0) {
              const impulse = ((1 + restitution) * velAlongNormal) / (s1.mass + s2.mass);
              s1.vel.x -= impulse * s2.mass * nx;
              s1.vel.y -= impulse * s2.mass * ny;
              s1.vel.z -= impulse * s2.mass * nz;

              s2.vel.x += impulse * s1.mass * nx;
              s2.vel.y += impulse * s1.mass * ny;
              s2.vel.z += impulse * s1.mass * nz;

              s1.isSettled = false;
              s2.isSettled = false;
            }
          }
        }
      }

      // 4. Frustum Boundaries (Floor, Side Walls, Front/Back Glass)
      const b = this.bounds;
      this.spheres.forEach(s => {
        const r = s.radius;

        // Invisible Floor
        const floorY = b.floorY + r;
        if (s.pos.y < floorY) {
          s.pos.y = floorY;
          s.vel.y = -s.vel.y * restitution;

          // Ground settling & rolling friction
          if (Math.abs(s.vel.y) < 1.0) {
            s.vel.y = 0;
            s.isSettled = true;
          }
          s.vel.x *= 0.95;
          s.vel.z *= 0.95;
        }

        // Left & Right Walls
        if (s.pos.x - r < -b.halfW) {
          s.pos.x = -b.halfW + r;
          s.vel.x = -s.vel.x * restitution;
        } else if (s.pos.x + r > b.halfW) {
          s.pos.x = b.halfW - r;
          s.vel.x = -s.vel.x * restitution;
        }

        // Depth bounds (Front/Back invisible glass to keep in play area)
        if (s.pos.z - r < b.depthMin) {
          s.pos.z = b.depthMin + r;
          s.vel.z = -s.vel.z * restitution;
        } else if (s.pos.z + r > b.depthMax) {
          s.pos.z = b.depthMax - r;
          s.vel.z = -s.vel.z * restitution;
        }

        // Ceiling cap
        const ceilingY = b.halfH * 1.6;
        if (s.pos.y > ceilingY) {
          s.pos.y = ceilingY;
          s.vel.y = -s.vel.y * 0.5;
        }
      });
    }

    // Sync 3D meshes to updated physics positions
    this.spheres.forEach(s => {
      s.mesh.position.copy(s.pos);
    });
  }

  // =========================================================================
  // Subtle Inline Control Hooks (Inspired by Shiyun Lu)
  // =========================================================================
  toggleCameraAngle() {
    this.cameraTilted = !this.cameraTilted;
    if (this.cameraTilted) {
      this.targetCameraPos.set(2.0, 3.2, 21.0);
      this.targetCameraLook.set(0, -1.5, 0);
    } else {
      this.targetCameraPos.set(0, 0, 20.0);
      this.targetCameraLook.set(0, 0, 0);
    }
    return this.cameraTilted;
  }

  toggleMouseColliderVisibility() {
    this.showMouseCollider = !this.showMouseCollider;
    if (this.mouseHelper) {
      this.mouseHelper.visible = this.showMouseCollider;
    }
    return this.showMouseCollider;
  }

  resetCascade() {
    // Rain all spheres down from the top
    this.spheres.forEach((s, i) => {
      s.pos.x = THREE.MathUtils.randFloat(-this.bounds.halfW * 0.85, this.bounds.halfW * 0.85);
      s.pos.y = this.bounds.halfH + THREE.MathUtils.randFloat(1, 8) + (i * 0.15);
      s.pos.z = THREE.MathUtils.randFloat(-1.2, 1.2);
      s.vel.set(
        THREE.MathUtils.randFloat(-1, 1),
        THREE.MathUtils.randFloat(-4, -1),
        THREE.MathUtils.randFloat(-0.5, 0.5)
      );
      s.isSettled = false;
      s.mesh.position.copy(s.pos);
    });
  }

  updateCamera(dt) {
    if (this.cameraTilted && this.mouse2D.x > -900) {
      const parallaxX = this.targetCameraPos.x + this.mouse2D.x * 1.5;
      const parallaxY = this.targetCameraPos.y + this.mouse2D.y * 1.0;
      this.camera.position.x += (parallaxX - this.camera.position.x) * 0.05;
      this.camera.position.y += (parallaxY - this.camera.position.y) * 0.05;
      this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * 0.05;
      this.camera.lookAt(this.targetCameraLook);
    } else {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      this.camera.lookAt(this.targetCameraLook);
    }
  }

  animate() {
    if (!this.isRunning) return;

    const dt = this.clock.getDelta();
    this.updatePhysics(dt);
    this.updateCamera(dt);

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
