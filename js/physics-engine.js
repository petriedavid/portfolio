/**
 * THREE.JS BOBA / BALL PIT PHYSICS ENGINE
 * Inspired by Shiyun Lu (shiyunlu.com)
 * 
 * Features:
 * - Real downward gravity (-Y) with camera-frustum floor and wall boundaries
 * - Snappy sphere-to-sphere collision & impulse resolution
 * - Tactile MeshPhysicalMaterial boba pearls with clearcoat and soft contact shadows
 * - Kinematic mouse ball collider that physically plows through settled spheres
 * - Responsive boundary recalculation and mobile auto-scaling
 */

import * as THREE from './vendor/three.module.js';

// Balls per world unit of floor width at full size.
const PILE_DENSITY = 1.2;

// The camera sits back from the balls (z = 0) so the floor in front of them can hold the name.
const CAMERA_Z = 25.5;
const CAMERA_LOOK_Z = 4.5;
const WALL_DISTANCE = 23; // Camera to the front row of balls
const NAME_Z_FAR = 3;
const NAME_Z_NEAR = 6.9;
const NAME_SHADOW_OPACITY = 0.13;

export class PhysicsCanvas {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = Object.assign({
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

    this.lastFrameTime = performance.now();
    this.isRunning = true;
    this.isPaused = false;
    this.rafId = null;

    this.targetCameraPos = new THREE.Vector3(0, 3.2, CAMERA_Z);
    this.targetCameraLook = new THREE.Vector3(0, -1.5, CAMERA_LOOK_Z);

    this.initScene();
    this.initLighting();
    this.initMaterials();
    this.initFloorShadowPlane();
    this.initNameShadow();
    this.updateFrustumBounds();
    this.spawnSpheres(this.getTargetSphereCount());
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
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
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

    // Primary Studio Key Light (shapes the highlights on the balls)
    this.keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    this.keyLight.position.set(10, 18, 14);
    this.scene.add(this.keyLight);

    // Overhead light that adds no brightness and only casts the floor shadows, so they
    // stay under the balls on both sides of the screen.
    if (this.options.shadows) {
      this.shadowLight = new THREE.DirectionalLight(0xFFFFFF, 0);
      this.shadowLight.position.set(0, 30, -3);
      this.shadowLight.castShadow = true;
      this.shadowLight.shadow.mapSize.set(2048, 1024);
      this.shadowLight.shadow.camera.near = 1;
      this.shadowLight.shadow.camera.far = 60;
      this.shadowLight.shadow.bias = -0.0005;
      this.shadowLight.shadow.radius = 6;
      this.scene.add(this.shadowLight);
    }

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

  // The name lies on the floor in front of the balls as a soft shadow, in the same perspective.
  initNameShadow() {
    this.nameCanvas = document.createElement('canvas');
    this.nameTexture = new THREE.CanvasTexture(this.nameCanvas);
    this.nameTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    this.nameShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: this.nameTexture,
        color: 0x000000,
        transparent: true,
        opacity: NAME_SHADOW_OPACITY,
        depthWrite: false,
        toneMapped: false
      })
    );
    this.nameShadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.nameShadow);

    // Redraw once the hero font loads so the two names match.
    document.fonts?.load('900 200px Geist')
      .then(() => {
        this.drawNameShadow();
        this.updateNameShadow();
      })
      .catch(() => {});
  }

  drawNameShadow() {
    const fontSize = 200;
    const lineGap = 44;
    const padding = 30;
    const blur = 5;
    const canvas = this.nameCanvas;
    const ctx = canvas.getContext('2d');

    const applyTextStyle = () => {
      ctx.font = `900 ${fontSize}px Geist, sans-serif`;
      ctx.letterSpacing = `${-0.04 * fontSize}px`;
    };

    applyTextStyle();
    const textWidth = Math.max(...this.nameLines.map(line => ctx.measureText(line).width));
    const capHeight = ctx.measureText('D').actualBoundingBoxAscent;

    // Resizing a canvas clears it and resets its drawing state.
    canvas.width = Math.ceil(textWidth + padding * 2);
    canvas.height = Math.ceil(capHeight * this.nameLines.length + lineGap * (this.nameLines.length - 1) + padding * 2);

    applyTextStyle();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    if ('filter' in ctx) {
      ctx.filter = `blur(${blur}px)`;
    } else {
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = blur * 2;
    }
    this.nameLines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, padding + capHeight * (i + 1) + lineGap * i);
    });

    this.nameTexture.dispose();
    this.nameTexture.needsUpdate = true;
  }

  updateNameShadow() {
    const lines = this.camera.aspect < 1.1 ? ['DAVID', 'PETRIE'] : ['DAVID PETRIE'];
    if (lines.length !== this.nameLines?.length) {
      this.nameLines = lines;
      this.drawNameShadow();
    }

    // Fit the width to the nearest row of letters, where the visible floor is narrowest.
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const visibleWidth = 2 * tanHalfFov * (CAMERA_Z - NAME_Z_NEAR + 2) * this.camera.aspect;
    const depth = NAME_Z_NEAR - NAME_Z_FAR;
    const textAspect = this.nameCanvas.width / this.nameCanvas.height;
    const width = Math.min(visibleWidth * 0.92, depth * textAspect);

    this.nameShadow.scale.set(width, depth, 1);
    this.nameShadow.position.set(0, this.bounds.floorY + 0.01, (NAME_Z_NEAR + NAME_Z_FAR) / 2);
  }

  fitShadowLight() {
    if (!this.shadowLight) return;

    // Covers the floor under every ball, plus room for blur and the light's slight angle.
    const shadowCamera = this.shadowLight.shadow.camera;
    const halfDepth = Math.max(-this.bounds.depthMin, this.bounds.depthMax) + 3;
    shadowCamera.left = -(this.bounds.halfW + 3);
    shadowCamera.right = this.bounds.halfW + 3;
    shadowCamera.top = halfDepth;
    shadowCamera.bottom = -halfDepth;
    shadowCamera.updateProjectionMatrix();
  }

  updateFrustumBounds() {
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const halfH = tanHalfFov * 20; // Keeps the floor and ceiling at a fixed world height

    this.bounds = {
      halfW: tanHalfFov * WALL_DISTANCE * this.camera.aspect,
      halfH,
      floorY: -halfH,
      depthMin: -3.6,
      depthMax: 2.4
    };

    this.floorShadowPlane.position.y = this.bounds.floorY;
    this.fitShadowLight();
    this.updateNameShadow();
  }

  // Pile height grows with total ball volume and shrinks with floor width, so ball size
  // and count follow the viewport to keep the settled pile below the hero text.
  getRadiusScale() {
    return THREE.MathUtils.clamp(this.bounds.halfW / 13, 0.8, 1);
  }

  getTargetSphereCount() {
    const floorWidth = this.bounds.halfW * 2;
    return Math.min(56, Math.round((PILE_DENSITY * floorWidth) / this.getRadiusScale() ** 3));
  }

  spawnSpheres(count) {
    this.spheres.forEach(s => {
      this.scene.remove(s.mesh);
      if (s.mesh.geometry) s.mesh.geometry.dispose();
    });
    this.spheres = [];

    const baseGeom = new THREE.SphereGeometry(1, 32, 32);
    const radiusScale = this.getRadiusScale();

    for (let i = 0; i < count; i++) {
      // Natural boba radius variety between 0.75 and 1.28
      const radius = THREE.MathUtils.randFloat(0.75, 1.28) * radiusScale;
      const mass = radius * radius * radius;

      let material = this.bobaMaterial;
      if (i % 7 === 0) material = this.chromeMaterial;
      else if (i % 3 === 0) material = this.graphiteMaterial;

      const mesh = new THREE.Mesh(baseGeom, material);
      mesh.scale.setScalar(radius);
      mesh.castShadow = true;

      // Initial placement: spread across upper and middle viewport to tumble in
      const startX = THREE.MathUtils.randFloat(-this.bounds.halfW * 0.85, this.bounds.halfW * 0.85);
      const startY = THREE.MathUtils.randFloat(-this.bounds.halfH * 0.2, this.bounds.halfH * 1.2);
      const startZ = THREE.MathUtils.randFloat(this.bounds.depthMin + 1, this.bounds.depthMax - 1);

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

    document.addEventListener('visibilitychange', () => this.syncRunState());
  }

  setPaused(paused) {
    this.isPaused = paused;
    this.syncRunState();
  }

  syncRunState() {
    const shouldRun = !this.isPaused && !document.hidden;
    if (shouldRun === this.isRunning) return;

    this.isRunning = shouldRun;
    if (shouldRun) {
      this.lastFrameTime = performance.now();
      this.prevMouse3D.copy(this.mouse3D);
      this.animate();
    } else if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
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

    const targetCount = this.getTargetSphereCount();
    if (Math.abs(targetCount - this.spheres.length) > this.spheres.length * 0.25) {
      this.spawnSpheres(targetCount);
    }
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse2D, this.camera);
    if (this.raycaster.ray.intersectPlane(this.mousePlane, this.planeIntersectPoint)) {
      this.mouse3D.copy(this.planeIntersectPoint);
    }
  }

  onPointerDown(e) {
    // If user clicked an interactive UI link or button, skip physics impulse
    if (e.target.closest('a, button, input, select, textarea, #menu-drawer')) {
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
    if (popped < 3 && this.spheres.length < Math.ceil(this.getTargetSphereCount() * 1.25)) {
      this.spawnBurst(3, this.mouse3D.x);
    }
  }

  spawnBurst(count, atX) {
    const baseGeom = new THREE.SphereGeometry(1, 32, 32);
    for (let i = 0; i < count; i++) {
      const radius = THREE.MathUtils.randFloat(0.8, 1.25) * this.getRadiusScale();
      const mass = radius * radius * radius;
      const mesh = new THREE.Mesh(baseGeom, i % 2 === 0 ? this.bobaMaterial : this.graphiteMaterial);
      mesh.scale.setScalar(radius);
      mesh.castShadow = true;

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

    // Calculate mouse velocity for kinematic impulse transfer. The cursor starts parked far
    // below the floor, so its first real position must not count as movement.
    if (this.prevMouse3D.y > -900) {
      this.mouseVel.copy(this.mouse3D).sub(this.prevMouse3D).divideScalar(cappedDt || 0.016);
      this.mouseVel.clampLength(0, 45); // Clamp maximum mouse velocity
    } else {
      this.mouseVel.set(0, 0, 0);
    }
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

  updateCamera(dt) {
    if (this.mouse2D.x > -900) {
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

    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

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
