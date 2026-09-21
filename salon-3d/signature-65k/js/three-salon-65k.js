/**
 * HABIB'S SIGNATURE SALON — ₹65,000 SIGNATURE 3D STUDIO
 * Dedicated Three.js WebGL Scene featuring:
 * 1. Signature Hydraulic Styling Chair (Italian Leather + Brushed Chrome)
 * 2. Haute Illuminated Vanity Mirror Station (Black Marble + Brass Trims + Halo LED)
 * 3. Interactive Camera Angle Presets (Orbit, Front, Chair Close-up, Vanity Mirror)
 * 4. 3D Raycaster Click-to-Book Direct Interaction
 */

class Signature65kStudioScene {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);
    if (!this.canvas || !this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.particles = null;

    // Chair and clickable meshes
    this.chairGroup = null;
    this.clickableMeshes = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Camera preset animation targets
    this.isTransitioning = false;
    this.camTargetPos = new THREE.Vector3(3.4, 2.4, 4.2);
    this.camTargetLook = new THREE.Vector3(0, 1.3, 0);

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08080a);
    this.scene.fog = new THREE.FogExp2(0x08080a, 0.055);

    // 2. Camera (Mobile-aware wide FOV for portrait screens)
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;
    const initialFov = aspect < 1.0 ? 60 : 42;
    this.camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 50);

    if (aspect < 1.0) {
      this.camera.position.set(3.8, 2.6, 4.8);
      this.camTargetPos.set(3.8, 2.6, 4.8);
    } else {
      this.camera.position.set(3.4, 2.4, 4.2);
      this.camTargetPos.set(3.4, 2.4, 4.2);
    }

    // 3. Renderer with high DPI and tone mapping
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't clip below floor
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 8.5;
    this.controls.target.set(0, 1.25, 0);

    // 5. Build Environment
    this.setupLighting();
    this.buildStudioFloorAndWalls();
    this.buildVanityStation();
    this.buildStylingChair();
    this.buildAmbientDust();

    // 6. Interaction & Resizing
    this.setupEvents();
    this.animate();
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.7);
    this.scene.add(ambientLight);

    // Main Overhead Chandelier Warm Spot
    const mainSpot = new THREE.SpotLight(0xfffaed, 2.8);
    mainSpot.position.set(0, 6, 2.2);
    mainSpot.angle = Math.PI / 3.5;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    mainSpot.shadow.bias = -0.0005;
    this.scene.add(mainSpot);

    // Mirror Accent Rim Light (Champagne Gold)
    const rimLight = new THREE.PointLight(0xd4af37, 2.2, 8);
    rimLight.position.set(0, 3.2, -1.2);
    this.scene.add(rimLight);

    // Subtle Violet Luxury Fill
    const fillViolet = new THREE.PointLight(0x8d43f4, 1.2, 10);
    fillViolet.position.set(-3.5, 2.8, 2.5);
    this.scene.add(fillViolet);

    // Golden Front Key
    const frontKey = new THREE.DirectionalLight(0xfff0d0, 1.4);
    frontKey.position.set(2.5, 4, 3.5);
    this.scene.add(frontKey);
  }

  buildStudioFloorAndWalls() {
    // 1. Luxurious Dark Chevron Hardwood / Marble Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.28,
      metalness: 0.35
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle Brass Circular Inlay on Floor
    const ringGeo = new THREE.RingGeometry(1.6, 1.63, 64);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25
    });
    const ring = new THREE.Mesh(ringGeo, brassMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.002, 0.6);
    this.scene.add(ring);

    // 2. Back Feature Wall with Vertical Paneling
    const wallGroup = new THREE.Group();
    const wallGeo = new THREE.BoxGeometry(14, 7, 0.3);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0e,
      roughness: 0.75,
      metalness: 0.1
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 3.5, -2.4);
    backWall.receiveShadow = true;
    wallGroup.add(backWall);

    // Vertical Brushed Brass Accent Slats
    const slatGeo = new THREE.BoxGeometry(0.04, 6.8, 0.05);
    [-3.8, -2.4, 2.4, 3.8].forEach(x => {
      const slat = new THREE.Mesh(slatGeo, brassMat);
      slat.position.set(x, 3.5, -2.23);
      wallGroup.add(slat);
    });

    // Glowing LED Cove Line
    const coveGeo = new THREE.BoxGeometry(12, 0.08, 0.1);
    const coveMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    const cove = new THREE.Mesh(coveGeo, coveMat);
    cove.position.set(0, 6.8, -2.2);
    wallGroup.add(cove);

    this.scene.add(wallGroup);
  }

  buildVanityStation() {
    const station = new THREE.Group();

    // 1. Black Polished Marble Counter
    const tableGeo = new THREE.BoxGeometry(3.2, 0.14, 1.1);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x09090c,
      roughness: 0.12,
      metalness: 0.8
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 1.15, -1.3);
    table.castShadow = true;
    table.receiveShadow = true;
    station.add(table);

    // Geometric Brass Legs
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2
    });
    const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.15, 16);
    [
      [-1.4, 0.575, -0.9],
      [1.4, 0.575, -0.9],
      [-1.4, 0.575, -1.7],
      [1.4, 0.575, -1.7]
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, brassMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      station.add(leg);
    });

    // 2. Arched Vanity Mirror Backing
    const mirrorBackGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 48);
    const mirrorBackMat = new THREE.MeshStandardMaterial({
      color: 0x060608,
      roughness: 0.5
    });
    const mirrorBack = new THREE.Mesh(mirrorBackGeo, mirrorBackMat);
    mirrorBack.rotation.x = Math.PI / 2;
    mirrorBack.position.set(0, 2.85, -1.82);
    station.add(mirrorBack);

    // Mirror Glass (Reflective)
    const glassGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.06, 48);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xd6e5f0,
      roughness: 0.03,
      metalness: 0.98
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(0, 2.85, -1.8);
    station.add(glass);

    // Glowing Halo LED Ring
    const haloGeo = new THREE.TorusGeometry(1.17, 0.035, 20, 60);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xffeed8,
      emissive: 0xffeed8,
      emissiveIntensity: 2.2,
      roughness: 0.2
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 2.85, -1.77);
    station.add(halo);

    // Tabletop Salon Essentials (Couture Hair Dryer, Scissor Stand, Amber Flask)
    // Amber Glass Serum Bottle
    const serumGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.16, 16);
    const serumMat = new THREE.MeshStandardMaterial({
      color: 0xcc8822,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const serum = new THREE.Mesh(serumGeo, serumMat);
    serum.position.set(0.9, 1.3, -1.1);
    serum.castShadow = true;
    station.add(serum);

    // Scissor Stand Chrome Cylinder
    const holderGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xefefef,
      metalness: 0.95,
      roughness: 0.1
    });
    const holder = new THREE.Mesh(holderGeo, chromeMat);
    holder.position.set(-0.9, 1.28, -1.1);
    holder.castShadow = true;
    station.add(holder);

    this.scene.add(station);
  }

  buildStylingChair() {
    this.chairGroup = new THREE.Group();

    // Luxury Materials
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x16161a,
      roughness: 0.38,
      metalness: 0.18
    });
    const leatherTuftMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f26,
      roughness: 0.42,
      metalness: 0.15
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5fa,
      metalness: 0.98,
      roughness: 0.08
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2
    });

    // 1. Heavy Round Hydraulic Base
    const baseGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.06, 36);
    const base = new THREE.Mesh(baseGeo, chromeMat);
    base.position.set(0, 0.03, 0.6);
    base.castShadow = true;
    base.receiveShadow = true;
    this.chairGroup.add(base);

    // Hydraulic Central Piston Cylinder
    const pistonGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.65, 24);
    const piston = new THREE.Mesh(pistonGeo, chromeMat);
    piston.position.set(0, 0.38, 0.6);
    piston.castShadow = true;
    this.chairGroup.add(piston);

    // Foot Pump Pedal Lever
    const pumpGeo = new THREE.BoxGeometry(0.38, 0.03, 0.06);
    const pump = new THREE.Mesh(pumpGeo, chromeMat);
    pump.position.set(0, 0.22, 0.88);
    pump.rotation.y = Math.PI / 4;
    this.chairGroup.add(pump);

    // 2. Ergonomic Seat Cushion
    const seatGeo = new THREE.BoxGeometry(0.85, 0.14, 0.82);
    const seat = new THREE.Mesh(seatGeo, leatherMat);
    seat.position.set(0, 0.76, 0.6);
    seat.castShadow = true;
    this.chairGroup.add(seat);

    // Tufted Seat Detail Insert
    const tuftGeo = new THREE.BoxGeometry(0.72, 0.03, 0.7);
    const tuft = new THREE.Mesh(tuftGeo, leatherTuftMat);
    tuft.position.set(0, 0.84, 0.6);
    this.chairGroup.add(tuft);

    // 3. Contoured Backrest
    const backGeo = new THREE.BoxGeometry(0.82, 0.78, 0.12);
    const back = new THREE.Mesh(backGeo, leatherMat);
    back.position.set(0, 1.25, 0.98);
    back.rotation.x = -0.12;
    back.castShadow = true;
    this.chairGroup.add(back);

    // Backrest Tufted Pillows
    const backTuftGeo = new THREE.BoxGeometry(0.7, 0.64, 0.03);
    const backTuft = new THREE.Mesh(backTuftGeo, leatherTuftMat);
    backTuft.position.set(0, 1.25, 0.92);
    backTuft.rotation.x = -0.12;
    this.chairGroup.add(backTuft);

    // Gold Habib's Crest Plate on Chair Back
    const plateGeo = new THREE.BoxGeometry(0.18, 0.08, 0.02);
    const plate = new THREE.Mesh(plateGeo, brassMat);
    plate.position.set(0, 1.48, 1.05);
    plate.rotation.x = -0.12;
    this.chairGroup.add(plate);

    // 4. Armrests with Polished Chrome Supports & Leather Pads
    [-0.46, 0.46].forEach(side => {
      // Support Bars
      const armBarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 16);
      const armBar = new THREE.Mesh(armBarGeo, chromeMat);
      armBar.position.set(side, 0.95, 0.6);
      armBar.castShadow = true;
      this.chairGroup.add(armBar);

      // Padded Arm Rest
      const padGeo = new THREE.BoxGeometry(0.1, 0.05, 0.6);
      const pad = new THREE.Mesh(padGeo, leatherMat);
      pad.position.set(side, 1.13, 0.6);
      pad.castShadow = true;
      this.chairGroup.add(pad);
    });

    // 5. Chrome Footrest Bar
    const footrestBarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.52, 16);
    const footrestBar = new THREE.Mesh(footrestBarGeo, chromeMat);
    footrestBar.position.set(0, 0.28, 0.15);
    footrestBar.rotation.z = Math.PI / 2;
    footrestBar.castShadow = true;
    this.chairGroup.add(footrestBar);

    // Footrest Bracket Arms
    [-0.24, 0.24].forEach(x => {
      const bracketGeo = new THREE.BoxGeometry(0.03, 0.03, 0.45);
      const bracket = new THREE.Mesh(bracketGeo, chromeMat);
      bracket.position.set(x, 0.48, 0.35);
      bracket.rotation.x = 0.52;
      this.chairGroup.add(bracket);
    });

    // Make chair clickable for 3D booking
    this.clickableMeshes.push(seat, back, tuft, base);

    this.scene.add(this.chairGroup);
  }

  buildAmbientDust() {
    const count = 75;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = Math.random() * 4 + 0.4;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xfceda1,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupEvents() {
    // Window Resize Observer (dynamically adapts FOV on phone orientation changes)
    const ro = new ResizeObserver(() => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.fov = this.camera.aspect < 1.0 ? 60 : 42;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    ro.observe(this.container);

    // Raycaster Click on Chair
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.clickableMeshes);

      if (intersects.length > 0) {
        if (window.openBookingWithService) {
          window.openBookingWithService('habib-1');
        } else if (window.openBookingModal) {
          window.openBookingModal(1);
        }
      }
    });

    // Change cursor on chair hover
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.clickableMeshes);
      this.canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
    });

    this.canvas.addEventListener('mousedown', () => {
      if (this.canvas.style.cursor !== 'pointer') {
        this.canvas.style.cursor = 'grabbing';
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      if (this.canvas.style.cursor !== 'pointer') {
        this.canvas.style.cursor = 'grab';
      }
    });
  }

  setCameraPreset(preset) {
    this.isTransitioning = true;
    const isMobile = this.camera.aspect < 1.0;

    switch (preset) {
      case 'orbit':
        if (isMobile) {
          this.camTargetPos.set(3.8, 2.6, 4.8);
          this.camTargetLook.set(0, 1.25, 0);
        } else {
          this.camTargetPos.set(3.4, 2.4, 4.2);
          this.camTargetLook.set(0, 1.25, 0);
        }
        break;
      case 'front':
        if (isMobile) {
          this.camTargetPos.set(0, 1.9, 4.5);
          this.camTargetLook.set(0, 1.35, 0);
        } else {
          this.camTargetPos.set(0, 1.8, 4.0);
          this.camTargetLook.set(0, 1.4, 0);
        }
        break;
      case 'chair':
        if (isMobile) {
          this.camTargetPos.set(1.5, 1.4, 2.4);
          this.camTargetLook.set(0, 0.95, 0.6);
        } else {
          this.camTargetPos.set(1.4, 1.4, 2.2);
          this.camTargetLook.set(0, 1.0, 0.6);
        }
        break;
      case 'mirror':
        if (isMobile) {
          this.camTargetPos.set(0.7, 2.6, 1.0);
          this.camTargetLook.set(0, 2.8, -1.8);
        } else {
          this.camTargetPos.set(0.6, 2.5, 0.8);
          this.camTargetLook.set(0, 2.8, -1.8);
        }
        break;
      default:
        this.camTargetPos.set(3.4, 2.4, 4.2);
        this.camTargetLook.set(0, 1.25, 0);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Gentle dust float
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += Math.sin(Date.now() * 0.001 + i) * 0.0012;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // Smooth camera interpolation on preset change
    if (this.isTransitioning) {
      this.camera.position.lerp(this.camTargetPos, 0.06);
      this.controls.target.lerp(this.camTargetLook, 0.06);

      if (this.camera.position.distanceTo(this.camTargetPos) < 0.05) {
        this.isTransitioning = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  const scene65k = new Signature65kStudioScene('threeSalonCanvas65k', 'salonCanvasContainer65k');
  window.salonScene65k = scene65k;

  // Connect camera preset pill buttons
  document.querySelectorAll('.cam-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cam-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.preset;
      scene65k.setCameraPreset(preset);
      if (window.playSalonSound) window.playSalonSound('click');
    });
  });
});
