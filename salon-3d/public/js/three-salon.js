/**
 * AURA 3D — THREE.JS SALON STUDIO & HAIR ATELIER
 * Built with Three.js (WebGL), PBR Materials, and Interactive OrbitControls
 */

// =============================================================================
// 1. SALON STUDIO 3D ENVIRONMENT
// =============================================================================

class SalonStudioScene {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);
    if (!this.canvas || !this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.particles = null;

    // Post-Processing
    this.composer = null;
    this.useBloom = false;

    // Lights
    this.keyLight = null;
    this.fillLight = null;
    this.rimLight = null;
    this.mirrorGlowLight = null;

    // Dynamic Visual Elements
    this.waterPlane = null;
    this.waterStream = null;
    this.mistParticles = null;
    this.chandelierGroup = null;

    // Hotspot & 3D Click-to-Book Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hotspotObjects = [];
    this.clickableMeshes = [];

    // Camera target for smooth lerp transitions
    this.camTargetPos = new THREE.Vector3(4.2, 3.2, 5.8);
    this.camTargetLook = new THREE.Vector3(0, 1.6, 0);

    // Guided Tour & Waypoints
    this.currentStationKey = 'overview';
    this.autoTourActive = false;
    this.autoTourTimer = null;
    this.isFullscreenTour = false;

    this.stations = {
      overview: {
        name: 'Salon Apple 3D Atelier',
        category: 'ZONE 01 • SALON ATELIER',
        title: 'Salon Apple Virtual Studio (Handewadi)',
        desc: 'Experience our luxury salon in Handewadi, Pune. Featuring backlit oval vanity mirrors, ergonomic styling chairs, and bespoke hair & skin rituals.',
        service: 'Bespoke Consultation & Haircut',
        serviceId: 'apple-haircut-nishant',
        price: 'From ₹550',
        pos: new THREE.Vector3(4.2, 3.2, 5.8),
        look: new THREE.Vector3(0, 1.6, 0)
      },
      chair: {
        name: 'Precision Styling Chair',
        category: 'ZONE 02 • ARCHITECTURAL CUT',
        title: 'Salon Apple Hydraulic Styling Chair',
        desc: 'Precision hydraulic styling chair calibrated for tailored cuts by Nishant and Praveen, global hair colouring, and couture blowouts.',
        service: 'Female Hair Package 1 (Wella Root Touch-up + Cut)',
        serviceId: 'apple-hair-1',
        price: '₹1,800',
        pos: new THREE.Vector3(0.0, 1.8, 3.2),
        look: new THREE.Vector3(0, 1.3, 0.6)
      },
      spa: {
        name: 'Therapy & Skin Suite',
        category: 'ZONE 03 • TRICHOLOGY DETOX',
        title: 'Head Spa & Facial Therapy Suite',
        desc: 'Deeply relaxing head massage therapy by Praveen and revitalizing skin facials by Ms. Sebi and Radha.',
        service: 'Festive Glow Package (For Her)',
        serviceId: 'apple-glow-her',
        price: '₹4,000',
        pos: new THREE.Vector3(-2.8, 2.1, 2.6),
        look: new THREE.Vector3(-3.8, 1.2, 0.4)
      },
      mirror: {
        name: 'Illuminated Oval Vanity Mirror',
        category: 'ZONE 04 • OPTICAL SPECTRUM',
        title: 'Halo Ring LED Backlit Mirror',
        desc: 'Warm ambient oval mirrors as featured in Salon Apple Handewadi, providing high-CRI lighting for true hair tone rendering.',
        service: 'Female Hair Package 2 (Global Colour + Spa)',
        serviceId: 'apple-hair-2',
        price: '₹4,500',
        pos: new THREE.Vector3(1.4, 2.8, 1.5),
        look: new THREE.Vector3(0, 2.9, -1.7)
      },
      atelier: {
        name: 'Nanoplastia & Hair Care Lab',
        category: 'ZONE 05 • BESPOKE FORMULATION',
        title: 'Luxury Formulation & Treatment Bar',
        desc: 'Wella professional colours, Nanogel, and Nanoplastia protein treatments for long-lasting mirror shine.',
        service: 'Nanoplastia Protein Treatment (Package 4)',
        serviceId: 'apple-hair-4',
        price: '₹10,000',
        pos: new THREE.Vector3(3.2, 1.8, 2.0),
        look: new THREE.Vector3(3.5, 1.4, -0.5)
      }
    };

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08080b);
    this.scene.fog = new THREE.FogExp2(0x08080b, 0.042);

    // 2. Camera (Mobile-aware wide FOV for portrait screens)
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const initialFov = aspect < 1.0 ? 64 : 45;
    this.camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 100);
    this.camera.position.copy(this.camTargetPos);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 14.0;
    this.controls.target.copy(this.camTargetLook);

    // 5. Build Environment & Objects
    this.buildLighting();
    this.buildArchitecture();
    this.buildMirrorStation();
    this.buildSalonChair();
    this.buildJapaneseHeadSpa();
    this.buildGlassDispensary();
    this.buildStudioChandelier();
    this.buildCosmeticTrolley();
    this.buildAtmosphericParticles();
    this.setupHotspots();

    // 6. Post-Processing (Unreal Bloom)
    this.initPostProcessing();

    // 7. Fullscreen 3D Guided Tour
    this.setupCinematicTour();

    // 8. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    this.setupPresetButtons();
    this.setupLightingButtons();

    // Canvas click for hotspot & click-to-book detection
    this.canvas.addEventListener('pointerdown', (e) => this.onCanvasClick(e));

    // 9. Start Render Loop
    this.animate();
  }

  buildLighting() {
    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0x201c18, 1.2);
    this.scene.add(this.ambientLight);

    // Main Studio Spot (Key light from above)
    this.keyLight = new THREE.SpotLight(0xffecd2, 4.2);
    this.keyLight.position.set(2.5, 6.5, 3.5);
    this.keyLight.angle = Math.PI / 4;
    this.keyLight.penumbra = 0.6;
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Warm Gold Fill Light
    this.fillLight = new THREE.PointLight(0xd4af37, 2.5, 12);
    this.fillLight.position.set(-3.5, 3.5, 2.5);
    this.scene.add(this.fillLight);

    // Cool Rim Light
    this.rimLight = new THREE.PointLight(0x8a9ba8, 1.8, 14);
    this.rimLight.position.set(3.5, 4.0, -3.0);
    this.scene.add(this.rimLight);

    // Mirror Ring Backlight
    this.mirrorGlowLight = new THREE.PointLight(0xffeedb, 3.2, 6);
    this.mirrorGlowLight.position.set(0, 2.5, -0.4);
    this.scene.add(this.mirrorGlowLight);
  }

  buildArchitecture() {
    // 1. Polished Marble Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x09090d,
      roughness: 0.12,
      metalness: 0.85
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Floor Subtle Grid / Inlay Lines
    const gridHelper = new THREE.GridHelper(24, 24, 0xd4af37, 0x1f1f28);
    gridHelper.position.y = 0.002;
    this.scene.add(gridHelper);

    // 2. Feature Back Wall (Obsidian Slate with Vertical Brass Trim)
    const wallGroup = new THREE.Group();
    const wallGeo = new THREE.BoxGeometry(16, 8, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.6,
      metalness: 0.2
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 4, -2.5);
    backWall.receiveShadow = true;
    wallGroup.add(backWall);

    // Vertical Brass Inlay Pillars
    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25
    });
    [-4.5, -2.2, 2.2, 4.5].forEach((posX) => {
      const trimGeo = new THREE.BoxGeometry(0.08, 8, 0.45);
      const trim = new THREE.Mesh(trimGeo, brassTrimMat);
      trim.position.set(posX, 4, -2.5);
      wallGroup.add(trim);
    });

    // Glowing Ceiling Cove Light Strip
    const coveGeo = new THREE.BoxGeometry(16, 0.15, 0.6);
    const coveMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    const cove = new THREE.Mesh(coveGeo, coveMat);
    cove.position.set(0, 7.8, -2.2);
    wallGroup.add(cove);

    this.scene.add(wallGroup);
  }

  buildMirrorStation() {
    const station = new THREE.Group();

    // 1. Sleek Black Marble Vanity Table
    const tableGeo = new THREE.BoxGeometry(3.6, 0.15, 1.2);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c10,
      roughness: 0.15,
      metalness: 0.7
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 1.2, -1.2);
    table.castShadow = true;
    table.receiveShadow = true;
    station.add(table);

    // Table Brass Frame Legs
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2
    });
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16);
    [
      [-1.6, 0.6, -0.8],
      [1.6, 0.6, -0.8],
      [-1.6, 0.6, -1.6],
      [1.6, 0.6, -1.6]
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, brassMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      station.add(leg);
    });

    // 2. Large Arched Vanity Mirror with Glowing LED Halo
    const mirrorBackGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.06, 48);
    const mirrorBackMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0d,
      roughness: 0.4
    });
    const mirrorBack = new THREE.Mesh(mirrorBackGeo, mirrorBackMat);
    mirrorBack.rotation.x = Math.PI / 2;
    mirrorBack.position.set(0, 3.1, -1.8);
    station.add(mirrorBack);

    // Mirror Glass Surface (Deep reflection)
    const mirrorGlassGeo = new THREE.CylinderGeometry(1.24, 1.24, 0.08, 48);
    const mirrorGlassMat = new THREE.MeshStandardMaterial({
      color: 0xdbe8f0,
      roughness: 0.04,
      metalness: 0.98
    });
    const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, mirrorGlassMat);
    mirrorGlass.rotation.x = Math.PI / 2;
    mirrorGlass.position.set(0, 3.1, -1.78);
    station.add(mirrorGlass);

    // Glowing Neon Ring Light (Emissive)
    const ringGeo = new THREE.TorusGeometry(1.26, 0.04, 20, 60);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffeedb,
      emissive: 0xffeedb,
      emissiveIntensity: 1.8,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 3.1, -1.74);
    station.add(ring);

    this.scene.add(station);
  }

  buildSalonChair() {
    this.chairGroup = new THREE.Group();

    // Materials
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.35,
      metalness: 0.15
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe8e8f0,
      metalness: 0.98,
      roughness: 0.12
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.22
    });

    // 1. Chrome Hydraulic Circular Base
    const baseGeo = new THREE.CylinderGeometry(0.75, 0.8, 0.08, 36);
    const base = new THREE.Mesh(baseGeo, chromeMat);
    base.position.set(0, 0.04, 0.6);
    base.receiveShadow = true;
    this.chairGroup.add(base);

    // 2. Hydraulic Center Column
    const columnGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 24);
    const column = new THREE.Mesh(columnGeo, chromeMat);
    column.position.set(0, 0.42, 0.6);
    column.castShadow = true;
    this.chairGroup.add(column);

    // Foot Pump Pedal
    const pumpGeo = new THREE.BoxGeometry(0.06, 0.04, 0.4);
    const pump = new THREE.Mesh(pumpGeo, chromeMat);
    pump.position.set(0, 0.25, 0.9);
    this.chairGroup.add(pump);

    // 3. Seat Cushion (Padded luxury contour)
    const seatGeo = new THREE.BoxGeometry(0.95, 0.18, 0.9);
    const seat = new THREE.Mesh(seatGeo, leatherMat);
    seat.position.set(0, 0.85, 0.6);
    seat.castShadow = true;
    seat.userData = { serviceId: 'Salon Apple-1', title: "Salon Apple's Precision Chair", price: 950 };
    this.chairGroup.add(seat);
    this.clickableMeshes.push(seat);

    // Brass Seat Underplate
    const underplateGeo = new THREE.BoxGeometry(1.0, 0.04, 0.95);
    const underplate = new THREE.Mesh(underplateGeo, brassMat);
    underplate.position.set(0, 0.74, 0.6);
    this.chairGroup.add(underplate);

    // 4. Ergonomic Curved Backrest
    const backGeo = new THREE.BoxGeometry(0.9, 0.95, 0.14);
    const back = new THREE.Mesh(backGeo, leatherMat);
    back.position.set(0, 1.35, 0.18);
    back.rotation.x = -0.1;
    back.castShadow = true;
    back.userData = { serviceId: 'Salon Apple-1', title: "Salon Apple's Precision Chair", price: 950 };
    this.chairGroup.add(back);
    this.clickableMeshes.push(back);

    // Headrest Cushion
    const headrestGeo = new THREE.BoxGeometry(0.45, 0.22, 0.12);
    const headrest = new THREE.Mesh(headrestGeo, leatherMat);
    headrest.position.set(0, 1.95, 0.12);
    headrest.castShadow = true;
    this.chairGroup.add(headrest);

    // 5. Armrests with Brass Supports
    [-0.55, 0.55].forEach((ax) => {
      // Brass Strut
      const armStrutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 16);
      const armStrut = new THREE.Mesh(armStrutGeo, brassMat);
      armStrut.position.set(ax, 1.05, 0.6);
      this.chairGroup.add(armStrut);

      // Leather Arm Pad
      const armPadGeo = new THREE.BoxGeometry(0.12, 0.06, 0.65);
      const armPad = new THREE.Mesh(armPadGeo, leatherMat);
      armPad.position.set(ax, 1.22, 0.6);
      armPad.castShadow = true;
      this.chairGroup.add(armPad);
    });

    // 6. Chrome Footrest Bar
    const footrestBarGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 16);
    const footrestBar = new THREE.Mesh(footrestBarGeo, chromeMat);
    footrestBar.rotation.z = Math.PI / 2;
    footrestBar.position.set(0, 0.32, 1.35);
    this.chairGroup.add(footrestBar);

    this.scene.add(this.chairGroup);
  }

  buildJapaneseHeadSpa() {
    const spaGroup = new THREE.Group();
    spaGroup.position.set(-3.8, 0, 0.4);

    // 1. Dark Teak Wood Platform
    const deckGeo = new THREE.BoxGeometry(2.4, 0.22, 3.8);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x141210,
      roughness: 0.35,
      metalness: 0.25
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 0.11, 0);
    deck.receiveShadow = true;
    spaGroup.add(deck);

    // Brass inlay trim around the deck
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.95
    });
    const brassTrimGeo = new THREE.BoxGeometry(2.44, 0.04, 3.84);
    const deckTrim = new THREE.Mesh(brassTrimGeo, brassMat);
    deckTrim.position.set(0, 0.21, 0);
    spaGroup.add(deckTrim);

    // 2. Ergonomic Spa Recliner Bed
    const bedBaseGeo = new THREE.BoxGeometry(0.85, 0.45, 2.2);
    const bedBaseMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.4
    });
    const bedBase = new THREE.Mesh(bedBaseGeo, bedBaseMat);
    bedBase.position.set(0, 0.45, -0.2);
    spaGroup.add(bedBase);

    // Luxury Quilted Black Leather Cushion
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x111114,
      roughness: 0.45,
      metalness: 0.1
    });
    const cushionGeo = new THREE.BoxGeometry(0.9, 0.16, 2.24);
    const cushion = new THREE.Mesh(cushionGeo, leatherMat);
    cushion.position.set(0, 0.72, -0.2);
    cushion.castShadow = true;
    cushion.userData = { serviceId: 'Salon Apple-4', title: 'Japanese Waterfall Head Spa', price: 2400 };
    spaGroup.add(cushion);
    this.clickableMeshes.push(cushion);

    // Contoured Headrest & Neck Cradle
    const headrestGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 24);
    const headrest = new THREE.Mesh(headrestGeo, leatherMat);
    headrest.rotation.z = Math.PI / 2;
    headrest.position.set(0, 0.86, -1.05);
    spaGroup.add(headrest);

    // 3. Black Ceramic Hydro-Basin
    const basinGeo = new THREE.CylinderGeometry(0.48, 0.36, 0.35, 32);
    const basinMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0d,
      roughness: 0.1,
      metalness: 0.8
    });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.set(0, 0.75, -1.5);
    basin.castShadow = true;
    basin.userData = { serviceId: 'Salon Apple-4', title: 'Japanese Waterfall Head Spa', price: 2400 };
    spaGroup.add(basin);
    this.clickableMeshes.push(basin);

    // Inner Pool Glistening Water Plane
    const waterGeo = new THREE.CircleGeometry(0.44, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x4cc9f0,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85
    });
    this.waterPlane = new THREE.Mesh(waterGeo, waterMat);
    this.waterPlane.rotation.x = -Math.PI / 2;
    this.waterPlane.position.set(0, 0.88, -1.5);
    spaGroup.add(this.waterPlane);

    // 4. Golden Arched Halo Waterfall Faucet
    const archGeo = new THREE.TorusGeometry(0.28, 0.025, 16, 32, Math.PI);
    const arch = new THREE.Mesh(archGeo, brassMat);
    arch.rotation.x = Math.PI;
    arch.rotation.z = Math.PI;
    arch.position.set(0, 1.15, -1.5);
    spaGroup.add(arch);

    // Falling Water Stream (Translucent animated cylinder)
    const streamGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.28, 16);
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x90e0ef,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1
    });
    this.waterStream = new THREE.Mesh(streamGeo, streamMat);
    this.waterStream.position.set(0, 1.02, -1.5);
    spaGroup.add(this.waterStream);

    // Soft Spa LED Underglow
    const spaLight = new THREE.PointLight(0x4cc9f0, 2.2, 4.0);
    spaLight.position.set(0, 1.05, -1.5);
    spaGroup.add(spaLight);

    // Rising Mist Particles
    const mistCount = 35;
    const mistGeo = new THREE.BufferGeometry();
    const mistPos = new Float32Array(mistCount * 3);
    for (let i = 0; i < mistCount; i++) {
      mistPos[i * 3 + 0] = (Math.random() - 0.5) * 0.7;
      mistPos[i * 3 + 1] = 0.9 + Math.random() * 0.6;
      mistPos[i * 3 + 2] = -1.5 + (Math.random() - 0.5) * 0.7;
    }
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
    const mistMat = new THREE.PointsMaterial({
      color: 0xddf4ff,
      size: 0.07,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    this.mistParticles = new THREE.Points(mistGeo, mistMat);
    spaGroup.add(this.mistParticles);

    this.scene.add(spaGroup);
  }

  buildGlassDispensary() {
    const dispGroup = new THREE.Group();
    dispGroup.position.set(3.6, 0, -0.6);

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2
    });

    // Tall Brass Shelving Pillars
    const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.4, 16);
    [
      [-0.7, 1.7, -0.3],
      [0.7, 1.7, -0.3],
      [-0.7, 1.7, 0.3],
      [0.7, 1.7, 0.3]
    ].forEach(([px, py, pz]) => {
      const pole = new THREE.Mesh(poleGeo, brassMat);
      pole.position.set(px, py, pz);
      dispGroup.add(pole);
    });

    // 3 Glass Shelves with Physical Transmission
    const shelfGeo = new THREE.BoxGeometry(1.5, 0.03, 0.65);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.52,
      thickness: 0.4
    });

    [0.9, 1.7, 2.5].forEach((shelfY, idx) => {
      const shelf = new THREE.Mesh(shelfGeo, glassMat);
      shelf.position.set(0, shelfY, 0);
      dispGroup.add(shelf);

      // Luxury Cosmetic Flacons
      const bottleColors = [0xd97706, 0x8D43F4, 0x10b981, 0xd4af37];
      [-0.45, -0.15, 0.15, 0.45].forEach((bx, bIdx) => {
        const bGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.22, 16);
        const bMat = new THREE.MeshPhysicalMaterial({
          color: bottleColors[(bIdx + idx) % bottleColors.length],
          roughness: 0.08,
          transmission: 0.85,
          ior: 1.45
        });
        const bottle = new THREE.Mesh(bGeo, bMat);
        bottle.position.set(bx, shelfY + 0.12, 0);
        dispGroup.add(bottle);

        const capGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.06, 16);
        const cap = new THREE.Mesh(capGeo, brassMat);
        cap.position.set(bx, shelfY + 0.25, 0);
        dispGroup.add(cap);
      });
    });

    const dispLight = new THREE.PointLight(0x8D43F4, 1.8, 4.2);
    dispLight.position.set(0, 2.2, 0.4);
    dispGroup.add(dispLight);

    this.scene.add(dispGroup);
  }

  buildStudioChandelier() {
    const chanGroup = new THREE.Group();
    chanGroup.position.set(0, 5.2, 0.2);

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2
    });

    // Outer Glowing Halo Ring
    const outerRingGeo = new THREE.TorusGeometry(1.6, 0.035, 16, 64);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0xfff3db,
      emissive: 0xffecd2,
      emissiveIntensity: 1.4,
      roughness: 0.3
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    chanGroup.add(outerRing);

    // Inner Accent Ring
    const innerRingGeo = new THREE.TorusGeometry(1.0, 0.025, 16, 48);
    const innerRing = new THREE.Mesh(innerRingGeo, brassMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -0.12;
    chanGroup.add(innerRing);

    // Suspension Cables
    const cableGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.8, 8);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
    [
      [-1.2, 0.9, 0],
      [1.2, 0.9, 0],
      [0, 0.9, -1.2],
      [0, 0.9, 1.2]
    ].forEach(([cx, cy, cz]) => {
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.position.set(cx, cy, cz);
      chanGroup.add(cable);
    });

    this.scene.add(chanGroup);
    this.chandelierGroup = chanGroup;
  }

  buildCosmeticTrolley() {
    const trolley = new THREE.Group();
    trolley.position.set(1.9, 0, 0.3);

    // Materials
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.65
    });

    // 3 Tiers of Trays
    [0.3, 0.75, 1.2].forEach((ty) => {
      const trayGeo = new THREE.BoxGeometry(0.8, 0.04, 0.55);
      const tray = new THREE.Mesh(trayGeo, glassMat);
      tray.position.y = ty;
      trolley.add(tray);
    });

    // Vertical Corner Rods
    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.3, 16);
    [
      [-0.38, 0.65, -0.25],
      [0.38, 0.65, -0.25],
      [-0.38, 0.65, 0.25],
      [0.38, 0.65, 0.25]
    ].forEach(([rx, ry, rz]) => {
      const rod = new THREE.Mesh(rodGeo, brassMat);
      rod.position.set(rx, ry, rz);
      trolley.add(rod);
    });

    // Cosmetic Flacons (Serums & Toners with Liquid Colors)
    const bottleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 16);
    const amberBottleMat = new THREE.MeshStandardMaterial({
      color: 0xd48837,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const roseBottleMat = new THREE.MeshStandardMaterial({
      color: 0xf58ea0,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const goldBottleMat = new THREE.MeshStandardMaterial({
      color: 0xf2d06b,
      roughness: 0.1,
      metalness: 0.8
    });

    const b1 = new THREE.Mesh(bottleGeo, amberBottleMat);
    b1.position.set(-0.2, 1.32, -0.1);
    trolley.add(b1);

    const b2 = new THREE.Mesh(bottleGeo, roseBottleMat);
    b2.position.set(0, 1.32, -0.1);
    trolley.add(b2);

    const b3 = new THREE.Mesh(bottleGeo, goldBottleMat);
    b3.position.set(0.2, 1.32, -0.1);
    trolley.add(b3);

    // Shears & Dryer styling props
    const dryerGeo = new THREE.BoxGeometry(0.18, 0.12, 0.08);
    const dryerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
    const dryer = new THREE.Mesh(dryerGeo, dryerMat);
    dryer.position.set(0.1, 1.28, 0.12);
    trolley.add(dryer);

    this.scene.add(trolley);
  }

  buildAtmosphericParticles() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 6.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random() * 0.04 + 0.01;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      color: 0xfceda1,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupHotspots() {
    // Interactive 3D Pins / Markers
    const pinGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xd4af37,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });

    // 1. Chair Pin
    const chairPin = new THREE.Mesh(pinGeo, pinMat.clone());
    chairPin.position.set(0, 1.8, 0.6);
    chairPin.userData = {
      category: 'STYLING SUITE',
      title: 'Hydraulic Quilted Chair',
      desc: 'Bespoke Italian leather chair equipped with integrated lumbar support and warm neck hydro-brace.',
      service: 'Signature Architectural Cut'
    };
    this.scene.add(chairPin);
    this.hotspotObjects.push(chairPin);

    // 2. Mirror Pin
    const mirrorPin = new THREE.Mesh(pinGeo, pinMat.clone());
    mirrorPin.position.set(0, 3.4, -1.6);
    mirrorPin.userData = {
      category: 'HAUTE VANITY',
      title: 'Illuminated Halo Vanity',
      desc: 'High-CRI daylight spectrum ring light for true chromatic tonal fidelity during balayage formulations.',
      service: 'Haute Balayage & French Glaze'
    };
    this.scene.add(mirrorPin);
    this.hotspotObjects.push(mirrorPin);

    // 3. Formulation Bar Pin
    const barPin = new THREE.Mesh(pinGeo, pinMat.clone());
    barPin.position.set(1.9, 1.6, 0.3);
    barPin.userData = {
      category: 'COLOR & TREATMENT BAR',
      title: 'Caviar & Peptide Infusion Cart',
      desc: 'Freshly mixed organic plant stem-cells and caviar keratin gloss ready for custom hair glazing.',
      service: 'Liquid Gold 24k Keratin Infusion'
    };
    this.scene.add(barPin);
    this.hotspotObjects.push(barPin);
  }

  initPostProcessing() {
    try {
      if (window.THREE && THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        const bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
          0.72,  // strength
          0.38,  // radius
          0.85   // threshold
        );

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
        this.useBloom = true;
      }
    } catch (err) {
      console.warn('Three.js UnrealBloomPass unavailable, using standard PBR:', err);
      this.useBloom = false;
    }
  }

  setupCinematicTour() {
    const enterBtn = document.getElementById('enterTourBtn');
    const exitBtn = document.getElementById('exitTourBtn');
    const nextBtn = document.getElementById('tourNextBtn');
    const prevBtn = document.getElementById('tourPrevBtn');
    const waypointDots = document.querySelectorAll('#tourWaypoints .waypoint-dot');
    const autoTourBtn = document.getElementById('autoTourBtn');
    const hudBookBtn = document.getElementById('hudBookBtn');
    const tourBookCurrentBtn = document.getElementById('tourBookCurrentBtn');
    const tourAudioBtn = document.getElementById('tourAudioBtn');

    enterBtn?.addEventListener('click', () => this.enterFullscreenTour());
    exitBtn?.addEventListener('click', () => this.exitFullscreenTour());

    const stationKeys = ['overview', 'chair', 'spa', 'mirror', 'atelier'];

    nextBtn?.addEventListener('click', () => {
      const idx = stationKeys.indexOf(this.currentStationKey);
      const nextKey = stationKeys[(idx + 1) % stationKeys.length];
      this.goToStation(nextKey);
      window.playSalonSound?.('click');
    });

    prevBtn?.addEventListener('click', () => {
      const idx = stationKeys.indexOf(this.currentStationKey);
      const prevKey = stationKeys[(idx - 1 + stationKeys.length) % stationKeys.length];
      this.goToStation(prevKey);
      window.playSalonSound?.('click');
    });

    waypointDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const st = dot.dataset.station;
        if (st && this.stations[st]) {
          this.goToStation(st);
          window.playSalonSound?.('click');
        }
      });
    });

    autoTourBtn?.addEventListener('click', () => {
      this.toggleAutoTour();
    });

    const handleStationBooking = () => {
      const current = this.stations[this.currentStationKey] || this.stations.overview;
      if (this.isFullscreenTour) {
        this.exitFullscreenTour();
      }
      if (window.openBookingWithService) {
        window.openBookingWithService(current.serviceId);
      } else {
        const openBtn = document.querySelector('.open-booking-btn');
        openBtn?.click();
      }
    };

    hudBookBtn?.addEventListener('click', handleStationBooking);
    tourBookCurrentBtn?.addEventListener('click', handleStationBooking);

    tourAudioBtn?.addEventListener('click', () => {
      const soundBtn = document.getElementById('soundToggleBtn');
      soundBtn?.click();
    });
  }

  goToStation(key) {
    const data = this.stations[key];
    if (!data) return;

    this.currentStationKey = key;
    this.camTargetPos.copy(data.pos);
    this.camTargetLook.copy(data.look);

    // Update HUD Card
    const cat = document.getElementById('hudCategory');
    const title = document.getElementById('hudTitle');
    const desc = document.getElementById('hudDesc');
    const srv = document.getElementById('hudService');
    const price = document.getElementById('hudPrice');
    const label = document.getElementById('tourStationLabel');
    const bookBtnText = document.getElementById('tourBookBtnText');
    const bookBtnClone = document.getElementById('tourBookBtnTextClone');

    if (cat) cat.textContent = data.category;
    if (title) title.textContent = data.title;
    if (desc) desc.textContent = data.desc;
    if (srv) srv.textContent = data.service;
    if (price) price.textContent = data.price;
    if (label) label.textContent = `${data.name} — ${data.price}`;
    if (bookBtnText) bookBtnText.textContent = `Reserve (${data.price})`;
    if (bookBtnClone) bookBtnClone.textContent = `Reserve (${data.price})`;

    // Update Waypoint dots
    document.querySelectorAll('#tourWaypoints .waypoint-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.station === key);
    });

    // Update Presets buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === key);
    });
  }

  enterFullscreenTour() {
    this.isFullscreenTour = true;
    const card = document.getElementById('heroViewportCard');
    const overlay = document.getElementById('fullscreenWalkthroughOverlay');
    if (card) card.classList.add('fullscreen-active');
    if (overlay) {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
    }
    setTimeout(() => this.onResize(), 60);
    this.goToStation(this.currentStationKey || 'overview');
    window.playSalonSound?.('chime');
  }

  exitFullscreenTour() {
    this.isFullscreenTour = false;
    const card = document.getElementById('heroViewportCard');
    const overlay = document.getElementById('fullscreenWalkthroughOverlay');
    if (card) card.classList.remove('fullscreen-active');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
    setTimeout(() => this.onResize(), 60);
  }

  toggleAutoTour() {
    this.autoTourActive = !this.autoTourActive;
    const autoTourBtn = document.getElementById('autoTourBtn');
    if (this.autoTourActive) {
      autoTourBtn?.classList.add('active');
      const keys = ['overview', 'chair', 'spa', 'mirror', 'atelier'];
      let idx = keys.indexOf(this.currentStationKey);
      this.autoTourTimer = setInterval(() => {
        idx = (idx + 1) % keys.length;
        this.goToStation(keys[idx]);
      }, 5500);
    } else {
      autoTourBtn?.classList.remove('active');
      if (this.autoTourTimer) clearInterval(this.autoTourTimer);
    }
  }

  onCanvasClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Direct 3D Click-to-Book on Chair and Spa bed
    const clickableHits = this.raycaster.intersectObjects(this.clickableMeshes, true);
    if (clickableHits.length > 0) {
      const data = clickableHits[0].object.userData;
      if (data && data.serviceId && window.openBookingWithService) {
        window.openBookingWithService(data.serviceId);
        window.playSalonSound?.('chime');
        return;
      }
    }

    // Hotspot Pins
    const intersects = this.raycaster.intersectObjects(this.hotspotObjects);
    if (intersects.length > 0) {
      const hit = intersects[0].object.userData;
      this.displayHotspotCard(hit);
    }
  }

  displayHotspotCard(data) {
    const card = document.getElementById('hotspotCard');
    const cat = document.getElementById('hotspotCategory');
    const title = document.getElementById('hotspotTitle');
    const desc = document.getElementById('hotspotDesc');

    if (!card) return;
    cat.textContent = data.category;
    title.textContent = data.title;
    desc.textContent = data.desc;

    card.style.display = 'block';
    card.style.opacity = '1';
  }

  setupPresetButtons() {
    const buttons = document.querySelectorAll('.preset-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        this.switchCameraView(view);
      });
    });
  }

  switchCameraView(view) {
    if (view === 'tour') {
      this.toggleAutoTour();
    } else if (this.stations[view]) {
      this.goToStation(view);
    }
  }

  setupLightingButtons() {
    const buttons = document.querySelectorAll('.light-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.light;
        this.switchLighting(mode);
      });
    });
  }

  switchLighting(mode) {
    if (mode === 'sunset') {
      this.keyLight.color.setHex(0xffecd2);
      this.keyLight.intensity = 4.2;
      this.fillLight.color.setHex(0xd4af37);
      this.ambientLight.color.setHex(0x201c18);
    } else if (mode === 'studio') {
      this.keyLight.color.setHex(0xffffff);
      this.keyLight.intensity = 5.0;
      this.fillLight.color.setHex(0xb0c4de);
      this.ambientLight.color.setHex(0x252530);
    } else if (mode === 'cyber') {
      this.keyLight.color.setHex(0xdb5aee);
      this.keyLight.intensity = 4.5;
      this.fillLight.color.setHex(0x00d2ff);
      this.ambientLight.color.setHex(0x180b24);
    }
  }

  onResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.isFullscreenTour ? window.innerWidth : this.container.clientWidth;
    const height = this.isFullscreenTour ? window.innerHeight : this.container.clientHeight;
    this.camera.aspect = width / height;
    if (this.camera.aspect < 1.0) {
      this.camera.fov = 64;
    } else {
      this.camera.fov = 45;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Smooth Camera Transition (Lerp)
    this.camera.position.lerp(this.camTargetPos, 0.05);
    this.controls.target.lerp(this.camTargetLook, 0.05);
    this.controls.update();

    // Gentle Chair idle rotation if in overview
    if (this.chairGroup && this.currentStationKey === 'overview') {
      this.chairGroup.rotation.y = Math.sin(Date.now() * 0.0006) * 0.15;
    }

    // Animated Flowing Water Stream & Ripple Pool in Waterfall Head Spa
    if (this.waterPlane) {
      const time = Date.now() * 0.004;
      this.waterPlane.scale.set(
        1 + Math.sin(time) * 0.03,
        1 + Math.cos(time) * 0.03,
        1
      );
    }
    if (this.waterStream) {
      this.waterStream.scale.y = 1 + Math.sin(Date.now() * 0.012) * 0.08;
    }

    // Rising Mist Particles
    if (this.mistParticles) {
      const mPos = this.mistParticles.geometry.attributes.position.array;
      for (let i = 1; i < mPos.length; i += 3) {
        mPos[i] += 0.0035;
        if (mPos[i] > 1.6) mPos[i] = 0.9;
      }
      this.mistParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Chandelier subtle breathing rotation
    if (this.chandelierGroup) {
      this.chandelierGroup.rotation.y = Date.now() * 0.00015;
    }

    // Atmospheric golden dust particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.003;
        if (positions[i] < 0) positions[i] = 6.0;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.useBloom && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}


// =============================================================================
// 2. 3D HAIR & COLOR ATELIER MANNEQUIN
// =============================================================================

class HairAtelierScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.hairMesh = null;
    this.hairMaterial = null;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0c11);

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 50);
    this.camera.position.set(0, 1.2, 3.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 2.4;
    this.controls.maxDistance = 5.5;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.target.set(0, 0.8, 0);

    // Studio Lighting for Hair Reflections
    const ambient = new THREE.AmbientLight(0x222228, 1.4);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff4e6, 3.5);
    key.position.set(2.5, 4, 3);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xa5c4d4, 2.5);
    rim.position.set(-2.5, 3, -2.5);
    this.scene.add(rim);

    // Build Mannequin and Hairstyle
    this.buildMannequin();

    window.addEventListener('resize', () => this.onResize());
    this.setupInteractions();
    this.animate();
  }

  buildMannequin() {
    this.mannequinGroup = new THREE.Group();

    // 1. Sleek Alabaster Mannequin Base Bust & Neck
    const bustMat = new THREE.MeshStandardMaterial({
      color: 0x1a1920,
      roughness: 0.45,
      metalness: 0.1
    });

    const neckGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.8, 32);
    const neck = new THREE.Mesh(neckGeo, bustMat);
    neck.position.set(0, 0.35, 0);
    this.mannequinGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.56, 36, 36);
    headGeo.scale(0.88, 1.15, 0.95);
    const head = new THREE.Mesh(headGeo, bustMat);
    head.position.set(0, 1.05, 0);
    this.mannequinGroup.add(head);

    // 2. Sculpted Couture Hairstyle Mesh with Rich PBR Hair Material
    this.hairMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#E2B777'),
      roughness: 0.25,
      metalness: 0.3,
      clearcoat: 0.85,
      clearcoatRoughness: 0.2,
      reflectivity: 0.9
    });

    const hairGroup = new THREE.Group();

    // Crown Volume
    const crownGeo = new THREE.SphereGeometry(0.64, 36, 36);
    crownGeo.scale(0.98, 1.18, 1.08);
    const crown = new THREE.Mesh(crownGeo, this.hairMaterial);
    crown.position.set(0, 1.18, -0.04);
    hairGroup.add(crown);

    // Layered Balayage Locks & Waves
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 1.8 - Math.PI * 0.9;
      const strandGeo = new THREE.CylinderGeometry(0.06, 0.14, 1.3, 16);
      strandGeo.translate(0, -0.65, 0);
      const strand = new THREE.Mesh(strandGeo, this.hairMaterial);

      const radius = 0.58;
      strand.position.set(
        Math.sin(angle) * radius,
        1.25,
        Math.cos(angle) * radius * 0.9
      );
      strand.rotation.z = -Math.sin(angle) * 0.3;
      strand.rotation.x = Math.cos(angle) * 0.2;
      hairGroup.add(strand);
    }

    // Front Curtain Fringe Framing
    [-0.32, 0.32].forEach((fx) => {
      const fringeGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.7, 16);
      fringeGeo.translate(0, -0.35, 0);
      const fringe = new THREE.Mesh(fringeGeo, this.hairMaterial);
      fringe.position.set(fx, 1.35, 0.42);
      fringe.rotation.z = fx * -0.4;
      hairGroup.add(fringe);
    });

    this.mannequinGroup.add(hairGroup);
    this.scene.add(this.mannequinGroup);
  }

  setHairColor(hexColor, roughness = 0.25) {
    if (!this.hairMaterial) return;
    this.hairMaterial.color.set(hexColor);
    this.hairMaterial.roughness = roughness;
  }

  setGloss(valPercent) {
    if (!this.hairMaterial) return;
    // Lower roughness = higher gloss
    const roughness = (100 - valPercent) / 100 * 0.7 + 0.08;
    this.hairMaterial.roughness = roughness;
    this.hairMaterial.clearcoat = (valPercent / 100);
  }

  setupInteractions() {
    // Swatches
    const swatches = document.querySelectorAll('.swatch-btn');
    swatches.forEach((sw) => {
      sw.addEventListener('click', () => {
        swatches.forEach((s) => s.classList.remove('active'));
        sw.classList.add('active');

        const color = sw.dataset.color;
        const name = sw.dataset.name;
        const roughness = parseFloat(sw.dataset.roughness || 0.25);

        this.setHairColor(color, roughness);

        // Update UI Indicator
        const dot = document.getElementById('activeShadeDot');
        const label = document.getElementById('activeShadeName');
        if (dot) dot.style.background = color;
        if (label) label.textContent = name;

        // Sound trigger
        if (window.playSalonSound) window.playSalonSound('click');
      });
    });

    // Gloss Slider
    const slider = document.getElementById('glossSlider');
    const glossVal = document.getElementById('glossValue');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (glossVal) glossVal.textContent = `${val}%`;
        this.setGloss(val);
      });
    }
  }

  onResize() {
    if (!this.canvas || !this.camera || !this.renderer) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();

    // Subtle gentle continuous turntable rotation
    if (this.mannequinGroup) {
      this.mannequinGroup.rotation.y += 0.0025;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate Scenes on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.salon3dStudio = new SalonStudioScene('threeSalonCanvas', 'salonCanvasContainer');
  window.hair3dAtelier = new HairAtelierScene('threeHairCanvas');
});
