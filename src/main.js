import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#park");
const statusEl = document.querySelector("#status");
const fpsLabel = document.querySelector("#fpsLabel");
const speedSlider = document.querySelector("#speedSlider");
const speedValue = document.querySelector("#speedValue");
const scene = new THREE.Scene();
const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(
  58,
  window.innerWidth / window.innerHeight,
  0.1,
  1200,
);
camera.position.set(85, 72, 100);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 9, 0);
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 22;
controls.maxDistance = 210;

const root = new THREE.Group();
scene.add(root);

const world = {
  setting: "day",
  pov: "normal",
  speed: 1,
  fps: {
    frames: 0,
    elapsed: 0,
  },
  coasterProgress: 0,
  ferrisAngle: 0,
  keys: {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  },
  bumperArena: {
    center: new THREE.Vector3(18, 2.15, -22),
    width: 38,
    depth: 28,
    radius: 2.55,
  },
  bumperCars: [],
  trees: [],
  lamps: [],
  snow: null,
  leaves: null,
  sun: null,
  moon: null,
  ambient: null,
  hemisphere: null,
  platform: null,
  grass: null,
  water: null,
  coasterTrain: [],
  playerCar: null,
  ferrisWheel: null,
  ferrisCabins: [],
  carousel: null,
  carouselHorses: [],
  carouselHorse: null,
};

const materials = {
  grass: new THREE.MeshStandardMaterial({ color: 0x16704b, roughness: 0.82 }),
  path: new THREE.MeshStandardMaterial({ color: 0xb79b6a, roughness: 0.85 }),
  steel: new THREE.MeshStandardMaterial({
    color: 0xaed0e8,
    roughness: 0.36,
    metalness: 0.22,
  }),
  blueSteel: new THREE.MeshStandardMaterial({
    color: 0x1262c7,
    roughness: 0.28,
    metalness: 0.25,
  }),
  railDark: new THREE.MeshStandardMaterial({
    color: 0x164a99,
    roughness: 0.32,
    metalness: 0.2,
  }),
  red: new THREE.MeshStandardMaterial({ color: 0xc62933, roughness: 0.48 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xf2cb37, roughness: 0.42 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xfff2c8, roughness: 0.55 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x6c3f24, roughness: 0.76 }),
  water: new THREE.MeshStandardMaterial({
    color: 0x0b65a3,
    roughness: 0.18,
    metalness: 0.05,
    transparent: true,
    opacity: 0.86,
  }),
  white: new THREE.MeshStandardMaterial({ color: 0xf3fbff, roughness: 0.55 }),
  black: new THREE.MeshStandardMaterial({ color: 0x101419, roughness: 0.58 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x91d9ff,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.72,
  }),
};

function mesh(geometry, material, position, castShadow = true, receiveShadow = true) {
  const item = new THREE.Mesh(geometry, material);
  item.position.copy(position);
  item.castShadow = castShadow;
  item.receiveShadow = receiveShadow;
  return item;
}

function roundedBox(width, height, depth, material) {
  return new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
}

function addLights() {
  world.ambient = new THREE.AmbientLight(0xffffff, 0.55);
  world.hemisphere = new THREE.HemisphereLight(0x9fdcff, 0x20492d, 0.75);
  world.sun = new THREE.DirectionalLight(0xffffff, 2.15);
  world.sun.position.set(-70, 120, 55);
  world.sun.castShadow = true;
  world.sun.shadow.mapSize.set(2048, 2048);
  world.sun.shadow.camera.near = 1;
  world.sun.shadow.camera.far = 280;
  world.sun.shadow.camera.left = -120;
  world.sun.shadow.camera.right = 120;
  world.sun.shadow.camera.top = 120;
  world.sun.shadow.camera.bottom = -120;

  world.moon = new THREE.DirectionalLight(0x9fc4ff, 0);
  world.moon.position.set(75, 110, -45);
  world.moon.castShadow = true;

  scene.add(world.ambient, world.hemisphere, world.sun, world.moon);
}

function createBase() {
  const base = mesh(
    new THREE.BoxGeometry(172, 3, 124),
    new THREE.MeshStandardMaterial({ color: 0x211915, roughness: 0.9 }),
    new THREE.Vector3(0, -2, 0),
    false,
    true,
  );
  root.add(base);

  world.grass = mesh(
    new THREE.BoxGeometry(158, 2, 110),
    materials.grass,
    new THREE.Vector3(0, 0, 0),
    false,
    true,
  );
  root.add(world.grass);

  world.platform = mesh(
    new THREE.BoxGeometry(42, 1.6, 82),
    new THREE.MeshStandardMaterial({ color: 0x2f4664, roughness: 0.7 }),
    new THREE.Vector3(8, 1.1, 0),
    false,
    true,
  );
  root.add(world.platform);

  const riverShape = new THREE.Shape();
  riverShape.moveTo(-12, -48);
  riverShape.bezierCurveTo(-4, -25, -14, -4, -5, 18);
  riverShape.bezierCurveTo(1, 34, 19, 47, 25, 52);
  riverShape.lineTo(35, 49);
  riverShape.bezierCurveTo(25, 38, 12, 29, 9, 14);
  riverShape.bezierCurveTo(4, -8, 15, -28, 2, -50);
  riverShape.lineTo(-12, -48);
  const river = new THREE.ExtrudeGeometry(riverShape, { depth: 0.25, bevelEnabled: false });
  river.rotateX(-Math.PI / 2);
  world.water = mesh(river, materials.water, new THREE.Vector3(0, 1.35, 0), false, true);
  root.add(world.water);

  addPath(-55, -28, 38, 5, 0.2);
  addPath(-25, 34, 96, 4, -0.12);
  addPath(42, -14, 54, 4, 0.95);
}

function addPath(x, z, width, depth, rotation) {
  const path = mesh(
    new THREE.BoxGeometry(width, 0.5, depth),
    materials.path,
    new THREE.Vector3(x, 1.55, z),
    false,
    true,
  );
  path.rotation.y = rotation;
  root.add(path);
}

function createCoasterCurve() {
  const points = [
    new THREE.Vector3(-70, 8, -37),
    new THREE.Vector3(-42, 15, -52),
    new THREE.Vector3(-5, 33, -43),
    new THREE.Vector3(36, 18, -45),
    new THREE.Vector3(70, 10, -22),
    new THREE.Vector3(74, 21, 18),
    new THREE.Vector3(42, 30, 42),
    new THREE.Vector3(2, 14, 48),
    new THREE.Vector3(-42, 27, 34),
    new THREE.Vector3(-77, 11, 12),
    new THREE.Vector3(-70, 8, -37),
  ];
  return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.42);
}

const coasterCurve = createCoasterCurve();

function createCoaster() {
  const railMaterial = materials.blueSteel;
  const tieMaterial = materials.railDark;
  [-1.45, 1.45].forEach((offset) => {
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(coasterCurve, 420, 0.36, 12, true),
      railMaterial,
    );
    rail.position.x = offset;
    rail.castShadow = true;
    rail.receiveShadow = true;
    root.add(rail);
  });

  for (let i = 0; i < 110; i += 1) {
    const point = coasterCurve.getPoint(i / 110);
    const tangent = coasterCurve.getTangent(i / 110);
    const tie = mesh(
      new THREE.BoxGeometry(4.4, 0.22, 0.52),
      tieMaterial,
      point.clone(),
      true,
      true,
    );
    tie.lookAt(point.clone().add(tangent));
    tie.rotateY(Math.PI / 2);
    root.add(tie);

    if (i % 5 === 0) {
      const supportHeight = Math.max(point.y - 1.6, 4);
      const support = mesh(
        new THREE.CylinderGeometry(0.22, 0.28, supportHeight, 8),
        materials.steel,
        new THREE.Vector3(point.x, supportHeight / 2 + 1, point.z),
      );
      root.add(support);
    }
  }

  const station = new THREE.Group();
  station.add(mesh(new THREE.BoxGeometry(18, 3, 12), materials.wood, new THREE.Vector3(0, 3, 0)));
  station.add(mesh(new THREE.BoxGeometry(20, 2, 14), materials.red, new THREE.Vector3(0, 6, 0)));
  station.add(mesh(new THREE.BoxGeometry(22, 0.6, 16), materials.cream, new THREE.Vector3(0, 7.3, 0)));
  station.position.set(-66, 1.6, -38);
  station.rotation.y = -0.2;
  root.add(station);

  world.coasterTrain = [];
  for (let i = 0; i < 5; i += 1) {
    const car = createCoasterCar(i % 2 ? materials.red : materials.blueSteel);
    car.userData.trainOffset = i * 0.011;
    world.coasterTrain.push(car);
    root.add(car);
  }
}

function createCoasterCar(bodyMaterial) {
  const car = new THREE.Group();
  car.add(mesh(new THREE.BoxGeometry(4.2, 1.25, 3), bodyMaterial, new THREE.Vector3(0, 0, 0)));
  car.add(mesh(new THREE.BoxGeometry(3.4, 0.35, 2.3), materials.cream, new THREE.Vector3(0, 0.8, 0)));
  car.add(mesh(new THREE.BoxGeometry(1.1, 0.42, 0.18), materials.black, new THREE.Vector3(0, 1.35, 1.58)));
  car.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 12), materials.black, new THREE.Vector3(-1.45, -0.65, 1.25)));
  car.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 12), materials.black, new THREE.Vector3(1.45, -0.65, 1.25)));
  car.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 12), materials.black, new THREE.Vector3(-1.45, -0.65, -1.25)));
  car.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 12), materials.black, new THREE.Vector3(1.45, -0.65, -1.25)));
  return car;
}

function createFerrisWheel() {
  const wheel = new THREE.Group();
  const frame = new THREE.Group();
  const radius = 18;

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.5, 12, 96),
    materials.blueSteel,
  );
  frame.add(rim);

  for (let i = 0; i < 12; i += 1) {
    const spoke = mesh(
      new THREE.BoxGeometry(0.32, radius * 2, 0.32),
      materials.steel,
      new THREE.Vector3(0, 0, 0),
    );
    spoke.rotation.z = (Math.PI / 12) * i;
    frame.add(spoke);
  }

  const hub = mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 24), materials.yellow, new THREE.Vector3(0, 0, 0));
  hub.rotation.x = Math.PI / 2;
  frame.add(hub);

  for (let i = 0; i < 10; i += 1) {
    const cabin = new THREE.Group();
    cabin.add(mesh(new THREE.BoxGeometry(4.4, 2.2, 2.6), i % 2 ? materials.red : materials.yellow, new THREE.Vector3(0, 0, 0)));
    cabin.add(mesh(new THREE.BoxGeometry(3.4, 1.1, 2.72), materials.glass, new THREE.Vector3(0, 0.25, 0)));
    cabin.userData.angle = (i / 10) * Math.PI * 2;
    world.ferrisCabins.push(cabin);
    frame.add(cabin);
  }

  world.ferrisWheel = frame;
  wheel.add(frame);

  const leftLeg = mesh(new THREE.BoxGeometry(1.4, 31, 1.4), materials.steel, new THREE.Vector3(-11, -14, 0));
  const rightLeg = mesh(new THREE.BoxGeometry(1.4, 31, 1.4), materials.steel, new THREE.Vector3(11, -14, 0));
  leftLeg.rotation.z = -0.34;
  rightLeg.rotation.z = 0.34;
  wheel.add(leftLeg, rightLeg);
  wheel.add(mesh(new THREE.BoxGeometry(28, 2, 8), materials.path, new THREE.Vector3(0, -31, 0), false, true));

  wheel.position.set(-42, 34, 12);
  root.add(wheel);
}

function createBumperCars() {
  const { center, width, depth } = world.bumperArena;
  const arena = new THREE.Group();
  arena.position.copy(center);

  const floor = mesh(
    new THREE.BoxGeometry(width, 0.65, depth),
    new THREE.MeshStandardMaterial({ color: 0x596b78, roughness: 0.42, metalness: 0.08 }),
    new THREE.Vector3(0, -0.2, 0),
    false,
    true,
  );
  arena.add(floor);

  for (let i = -16; i <= 16; i += 4) {
    arena.add(mesh(new THREE.BoxGeometry(0.08, 0.05, depth - 2), materials.steel, new THREE.Vector3(i, 0.16, 0), false, true));
  }
  for (let i = -12; i <= 12; i += 4) {
    arena.add(mesh(new THREE.BoxGeometry(width - 2, 0.05, 0.08), materials.steel, new THREE.Vector3(0, 0.18, i), false, true));
  }

  const railMaterial = new THREE.MeshStandardMaterial({ color: 0xf2cb37, roughness: 0.35 });
  [
    [0, 1.1, -depth / 2, width, 1.7, 0.8],
    [0, 1.1, depth / 2, width, 1.7, 0.8],
    [-width / 2, 1.1, 0, 0.8, 1.7, depth],
    [width / 2, 1.1, 0, 0.8, 1.7, depth],
  ].forEach(([x, y, z, sx, sy, sz]) => {
    arena.add(mesh(new THREE.BoxGeometry(sx, sy, sz), railMaterial, new THREE.Vector3(x, y, z), true, true));
  });

  const roof = mesh(
    new THREE.CylinderGeometry(3, 3, 0.65, 24),
    materials.red,
    new THREE.Vector3(0, 10.8, 0),
  );
  arena.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 10, 12), materials.steel, new THREE.Vector3(0, 5.5, 0)));
  arena.add(roof);

  root.add(arena);

  const carSpecs = [
    { x: 8, z: -4, color: materials.blueSteel, player: true, heading: 0.4 },
    { x: -8, z: -5, color: materials.red, heading: 2.4 },
    { x: 0, z: 7, color: materials.yellow, heading: -1.1 },
    { x: 12, z: 7, color: materials.cream, heading: 3.3 },
    { x: -13, z: 6, color: materials.glass, heading: 0.2 },
    { x: -2, z: -10, color: materials.red, heading: -2.4 },
  ];

  carSpecs.forEach((spec, index) => {
    const car = createBumperCar(spec.color, spec.player);
    car.group.position.set(center.x + spec.x, center.y + 0.6, center.z + spec.z);
    car.heading = spec.heading;
    car.group.rotation.y = spec.heading;
    car.aiTimer = index * 0.7;
    car.targetHeading = spec.heading;
    world.bumperCars.push(car);
    root.add(car.group);
    if (spec.player) {
      world.playerCar = car;
    }
  });
}

function createBumperCar(bodyMaterial, isPlayer = false) {
  const group = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(2.35, 2.55, 0.8, 28), materials.black, new THREE.Vector3(0, 0.35, 0));
  const body = mesh(new THREE.BoxGeometry(3.5, 1, 2.8), bodyMaterial, new THREE.Vector3(0, 1.05, 0));
  const seat = mesh(new THREE.BoxGeometry(1.4, 0.75, 1.2), materials.black, new THREE.Vector3(-0.45, 1.75, 0));
  const nose = mesh(new THREE.ConeGeometry(0.85, 1.4, 16), materials.cream, new THREE.Vector3(0, 1.08, 1.9));
  const pole = mesh(new THREE.CylinderGeometry(0.07, 0.07, 5.4, 8), materials.steel, new THREE.Vector3(0.95, 3.35, -0.65));
  const flag = mesh(new THREE.BoxGeometry(1, 0.55, 0.08), isPlayer ? materials.yellow : materials.red, new THREE.Vector3(1.42, 5.95, -0.65));
  nose.rotation.x = Math.PI / 2;
  group.add(base, body, seat, nose, pole, flag);

  for (let x = -1.15; x <= 1.15; x += 2.3) {
    for (let z = -0.95; z <= 0.95; z += 1.9) {
      const wheel = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.32, 14), materials.black, new THREE.Vector3(x, 0.2, z));
      wheel.rotation.z = Math.PI / 2;
      group.add(wheel);
    }
  }

  return {
    group,
    velocity: new THREE.Vector2(),
    heading: 0,
    targetHeading: 0,
    aiTimer: 0,
    isPlayer,
  };
}

function createParkBuildings() {
  const tower = new THREE.Group();
  tower.add(mesh(new THREE.BoxGeometry(9, 44, 9), materials.wood, new THREE.Vector3(0, 22, 0)));
  tower.add(mesh(new THREE.ConeGeometry(7, 12, 4), materials.blueSteel, new THREE.Vector3(0, 50, 0)));
  tower.add(mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.7, 32), materials.cream, new THREE.Vector3(0, 37, 4.8)));
  tower.position.set(33, 1.5, 4);
  root.add(tower);

  const carousel = new THREE.Group();
  carousel.add(mesh(new THREE.CylinderGeometry(15, 15, 2.2, 56), materials.cream, new THREE.Vector3(0, 1, 0)));
  carousel.add(mesh(new THREE.CylinderGeometry(12.5, 14, 6.5, 56), materials.red, new THREE.Vector3(0, 5.3, 0)));
  carousel.add(mesh(new THREE.ConeGeometry(15.8, 8.5, 56), materials.yellow, new THREE.Vector3(0, 12.8, 0)));
  carousel.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 15, 16), materials.steel, new THREE.Vector3(0, 7.5, 0)));
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    const horse = new THREE.Group();
    horse.position.set(Math.cos(angle) * 9, 4.35, Math.sin(angle) * 9);
    horse.add(mesh(new THREE.BoxGeometry(2.6, 1.2, 0.75), i % 2 ? materials.blueSteel : materials.red, new THREE.Vector3(0, 0, 0)));
    horse.add(mesh(new THREE.BoxGeometry(0.75, 0.65, 0.65), materials.cream, new THREE.Vector3(1.45, 0.32, 0)));
    horse.add(mesh(new THREE.ConeGeometry(0.38, 0.9, 12), materials.cream, new THREE.Vector3(1.95, 0.35, 0)));
    horse.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 10), materials.black, new THREE.Vector3(-0.8, -0.85, -0.28)));
    horse.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 10), materials.black, new THREE.Vector3(0.8, -0.85, -0.28)));
    horse.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 10), materials.black, new THREE.Vector3(-0.8, -0.85, 0.28)));
    horse.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 10), materials.black, new THREE.Vector3(0.8, -0.85, 0.28)));
    horse.userData.baseY = 4.35;
    horse.userData.rideAngle = angle;
    horse.rotation.y = -angle;
    carousel.add(horse);
    carousel.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 7.8, 10), materials.steel, new THREE.Vector3(Math.cos(angle) * 9, 4.9, Math.sin(angle) * 9)));
    world.carouselHorses.push(horse);
    if (i === 0) {
      world.carouselHorse = horse;
    }
  }
  carousel.position.set(24, 1.55, 28);
  carousel.userData.spin = true;
  root.add(carousel);
  world.carousel = carousel;

  addBuilding(-24, -4, 16, 18, 10, materials.red, materials.cream);
  addBuilding(61, -31, 17, 12, 8, materials.yellow, materials.blueSteel);
  addBuilding(-54, 35, 22, 10, 7, materials.wood, materials.red);
}

function addBuilding(x, z, width, depth, height, wallMaterial, roofMaterial) {
  const building = new THREE.Group();
  building.add(mesh(new THREE.BoxGeometry(width, height, depth), wallMaterial, new THREE.Vector3(0, height / 2, 0)));
  building.add(mesh(new THREE.ConeGeometry(Math.max(width, depth) * 0.62, 6, 4), roofMaterial, new THREE.Vector3(0, height + 3, 0)));
  building.position.set(x, 1.3, z);
  root.add(building);
}

function createTreesAndLamps() {
  const treePositions = [
    [-65, 18], [-57, 24], [-48, 45], [-30, 48], [-3, 42], [22, 34],
    [58, 7], [64, -16], [44, -38], [12, -42], [-28, -38], [-64, -10],
  ];

  treePositions.forEach(([x, z], index) => {
    const tree = new THREE.Group();
    tree.add(mesh(new THREE.CylinderGeometry(0.75, 0.95, 6, 8), materials.wood, new THREE.Vector3(0, 3, 0)));
    const crown = mesh(
      new THREE.SphereGeometry(3.5 + (index % 3) * 0.4, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x0c5c43, roughness: 0.8 }),
      new THREE.Vector3(0, 8, 0),
    );
    tree.add(crown);
    tree.position.set(x, 1.3, z);
    tree.userData.crown = crown;
    root.add(tree);
    world.trees.push(tree);
  });

  for (let i = 0; i < 24; i += 1) {
    const t = i / 24;
    const point = coasterCurve.getPoint(t);
    const lamp = new THREE.Group();
    lamp.add(mesh(new THREE.CylinderGeometry(0.12, 0.16, 6, 8), materials.black, new THREE.Vector3(0, 3, 0)));
    lamp.add(mesh(new THREE.SphereGeometry(0.62, 16, 10), materials.cream, new THREE.Vector3(0, 6.35, 0)));
    const glow = new THREE.PointLight(0xffe7a1, 0.15, 22, 2);
    glow.position.set(0, 6.35, 0);
    lamp.add(glow);
    lamp.position.set(point.x * 0.88, 1.4, point.z * 0.88);
    root.add(lamp);
    world.lamps.push({ lamp, glow });
  }
}

function createWeatherParticles() {
  world.snow = makeParticleField(650, 0xf7fbff, 0.14, 90);
  world.leaves = makeParticleField(380, 0xc85d24, 0.22, 70);
  root.add(world.snow, world.leaves);
}

function makeParticleField(count, color, size, range) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = THREE.MathUtils.randFloatSpread(range * 2);
    positions[i * 3 + 1] = THREE.MathUtils.randFloat(12, 75);
    positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(range * 1.55);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color, size, sizeAttenuation: true });
  const points = new THREE.Points(geometry, material);
  points.visible = false;
  return points;
}

function updateTrain(delta) {
  world.coasterProgress = (world.coasterProgress + delta * 0.055) % 1;
  world.coasterTrain.forEach((car) => {
    const progress = (world.coasterProgress - car.userData.trainOffset + 1) % 1;
    const point = coasterCurve.getPointAt(progress);
    const tangent = coasterCurve.getTangentAt(progress);
    car.position.copy(point);
    car.position.y += 1.45;
    car.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
  });
}

function updateBumperCars(delta) {
  const { center, width, depth, radius } = world.bumperArena;
  const left = center.x - width / 2 + radius;
  const right = center.x + width / 2 - radius;
  const top = center.z - depth / 2 + radius;
  const bottom = center.z + depth / 2 - radius;

  world.bumperCars.forEach((car) => {
    if (car.isPlayer) {
      const turn = Number(world.keys.ArrowLeft) - Number(world.keys.ArrowRight);
      const drive = Number(world.keys.ArrowUp) - Number(world.keys.ArrowDown);
      car.heading += turn * delta * 2.8;
      const force = drive * delta * 28;
      car.velocity.x += Math.sin(car.heading) * force;
      car.velocity.y += Math.cos(car.heading) * force;
    } else {
      car.aiTimer -= delta;
      if (car.aiTimer <= 0) {
        car.aiTimer = THREE.MathUtils.randFloat(0.9, 2.2);
        car.targetHeading += THREE.MathUtils.randFloat(-1.25, 1.25);
      }
      car.heading = THREE.MathUtils.lerp(car.heading, car.targetHeading, delta * 1.2);
      car.velocity.x += Math.sin(car.heading) * delta * 10.5;
      car.velocity.y += Math.cos(car.heading) * delta * 10.5;
    }

    car.velocity.multiplyScalar(Math.max(0, 1 - delta * 1.55));
    car.velocity.clampLength(0, car.isPlayer ? 16 : 9.5);
    car.group.position.x += car.velocity.x * delta;
    car.group.position.z += car.velocity.y * delta;

    if (car.group.position.x < left || car.group.position.x > right) {
      car.group.position.x = THREE.MathUtils.clamp(car.group.position.x, left, right);
      car.velocity.x *= -0.72;
      car.targetHeading = Math.PI - car.heading;
    }
    if (car.group.position.z < top || car.group.position.z > bottom) {
      car.group.position.z = THREE.MathUtils.clamp(car.group.position.z, top, bottom);
      car.velocity.y *= -0.72;
      car.targetHeading = -car.heading;
    }
  });

  for (let i = 0; i < world.bumperCars.length; i += 1) {
    for (let j = i + 1; j < world.bumperCars.length; j += 1) {
      resolveBumperCollision(world.bumperCars[i], world.bumperCars[j], radius * 1.75);
    }
  }

  world.bumperCars.forEach((car) => {
    if (car.velocity.lengthSq() > 0.12) {
      car.heading = Math.atan2(car.velocity.x, car.velocity.y);
    }
    car.group.rotation.y = car.heading;
    car.group.rotation.z = THREE.MathUtils.clamp(-car.velocity.x * 0.018, -0.12, 0.12);
    car.group.rotation.x = THREE.MathUtils.clamp(car.velocity.y * 0.018, -0.12, 0.12);
  });
}

function resolveBumperCollision(a, b, minDistance) {
  const dx = b.group.position.x - a.group.position.x;
  const dz = b.group.position.z - a.group.position.z;
  const distance = Math.hypot(dx, dz) || 0.001;
  if (distance >= minDistance) return;

  const nx = dx / distance;
  const nz = dz / distance;
  const overlap = minDistance - distance;
  a.group.position.x -= nx * overlap * 0.5;
  a.group.position.z -= nz * overlap * 0.5;
  b.group.position.x += nx * overlap * 0.5;
  b.group.position.z += nz * overlap * 0.5;

  const av = a.velocity.x * nx + a.velocity.y * nz;
  const bv = b.velocity.x * nx + b.velocity.y * nz;
  const impulse = (bv - av) * 0.92;
  a.velocity.x += impulse * nx;
  a.velocity.y += impulse * nz;
  b.velocity.x -= impulse * nx;
  b.velocity.y -= impulse * nz;
}

function updateFerris(delta) {
  world.ferrisAngle += delta * 0.18;
  world.ferrisWheel.rotation.z = world.ferrisAngle;
  const radius = 18;
  world.ferrisCabins.forEach((cabin) => {
    const angle = cabin.userData.angle;
    cabin.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    cabin.rotation.z = -world.ferrisAngle;
  });
}

function updateEnvironment(delta) {
  const time = clock.elapsedTime;
  world.water.material.color.offsetHSL(0, 0, Math.sin(time * 1.8 * Math.max(world.speed, 0.2)) * 0.0005);

  if (world.carousel) {
    world.carousel.rotation.y += delta * 0.45;
    world.carouselHorses.forEach((horse) => {
      horse.position.y =
        horse.userData.baseY +
        Math.sin(clock.elapsedTime * 2.2 + horse.userData.rideAngle) * 0.65;
    });
  }

  if (world.snow.visible) {
    driftParticles(world.snow, delta, -12, 76, 0.6);
  }

  if (world.leaves.visible) {
    driftParticles(world.leaves, delta, -8, 70, 1.7);
  }
}

function driftParticles(points, delta, bottom, top, sway) {
  const position = points.geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const y = position.getY(i) - delta * (4 + sway * 1.8);
    position.setY(i, y < bottom ? top : y);
    position.setX(i, position.getX(i) + Math.sin(clock.elapsedTime + i) * delta * sway);
  }
  position.needsUpdate = true;
}

function applySetting(setting) {
  world.setting = setting;
  const configs = {
    day: {
      sky: 0x8fd3ff,
      fog: 0x8fd3ff,
      grass: 0x16704b,
      sun: 2.15,
      moon: 0,
      ambient: 0.55,
      hemi: 0.75,
      snow: false,
      leaves: false,
      lamp: 0.12,
      tree: 0x0c5c43,
    },
    winter: {
      sky: 0xc9e4f5,
      fog: 0xe5f6ff,
      grass: 0xe8f3f7,
      sun: 1.65,
      moon: 0,
      ambient: 0.72,
      hemi: 0.9,
      snow: true,
      leaves: false,
      lamp: 0.22,
      tree: 0xd9ebee,
    },
    summer: {
      sky: 0x64c7ff,
      fog: 0x9ee9ff,
      grass: 0x28a458,
      sun: 2.55,
      moon: 0,
      ambient: 0.66,
      hemi: 0.82,
      snow: false,
      leaves: false,
      lamp: 0.1,
      tree: 0x108a4d,
    },
    fall: {
      sky: 0xf0b06a,
      fog: 0xf1c08d,
      grass: 0x8b7c35,
      sun: 1.9,
      moon: 0,
      ambient: 0.62,
      hemi: 0.72,
      snow: false,
      leaves: true,
      lamp: 0.24,
      tree: 0xb35b1e,
    },
    night: {
      sky: 0x071632,
      fog: 0x071632,
      grass: 0x06382e,
      sun: 0,
      moon: 1.45,
      ambient: 0.24,
      hemi: 0.32,
      snow: false,
      leaves: false,
      lamp: 1.35,
      tree: 0x073326,
    },
  };

  const config = configs[setting];
  scene.background = new THREE.Color(config.sky);
  scene.fog = new THREE.Fog(config.fog, 105, 260);
  world.grass.material.color.setHex(config.grass);
  world.sun.intensity = config.sun;
  world.moon.intensity = config.moon;
  world.ambient.intensity = config.ambient;
  world.hemisphere.intensity = config.hemi;
  world.snow.visible = config.snow;
  world.leaves.visible = config.leaves;
  world.lamps.forEach(({ glow }) => {
    glow.intensity = config.lamp;
  });
  world.trees.forEach((tree) => {
    tree.userData.crown.material.color.setHex(config.tree);
  });
}

function updateCamera() {
  if (world.pov === "normal") {
    controls.enabled = true;
    controls.update();
    return;
  }

  controls.enabled = false;

  if (world.pov === "coaster") {
    const leadCar = world.coasterTrain[0];
    const forward = new THREE.Vector3(Math.sin(leadCar.rotation.y), 0, Math.cos(leadCar.rotation.y));
    camera.position.copy(leadCar.position).add(new THREE.Vector3(0, 2.4, 0)).add(forward.clone().multiplyScalar(-1.6));
    camera.lookAt(leadCar.position.clone().add(forward.multiplyScalar(12)).add(new THREE.Vector3(0, 1.5, 0)));
  }

  if (world.pov === "ferris") {
    const cabin = world.ferrisCabins[1];
    const worldPosition = new THREE.Vector3();
    cabin.getWorldPosition(worldPosition);
    camera.position.copy(worldPosition).add(new THREE.Vector3(0, 1.1, 3.6));
    camera.lookAt(new THREE.Vector3(10, 15, -18));
  }

  if (world.pov === "carousel") {
    const horsePosition = new THREE.Vector3();
    world.carouselHorse.getWorldPosition(horsePosition);
    const forward = new THREE.Vector3();
    world.carouselHorse.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    camera.position.copy(horsePosition).add(new THREE.Vector3(0, 2.0, 0)).add(forward.clone().multiplyScalar(-1.4));
    camera.lookAt(horsePosition.clone().add(new THREE.Vector3(0, 1.6, 0)).add(forward.multiplyScalar(8)));
  }

  if (world.pov === "bumper") {
    const car = world.playerCar;
    const forward = new THREE.Vector3(Math.sin(car.heading), 0, Math.cos(car.heading));
    camera.position.copy(car.group.position).add(new THREE.Vector3(0, 4.2, 0)).add(forward.clone().multiplyScalar(-5.2));
    camera.lookAt(car.group.position.clone().add(forward.multiplyScalar(8)).add(new THREE.Vector3(0, 1.5, 0)));
  }
}

function bindControls() {
  document.querySelector("#settingControls").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    document.querySelectorAll("[data-setting]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applySetting(button.dataset.setting);
  });

  document.querySelector("#povControls").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    document.querySelectorAll("[data-pov]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    world.pov = button.dataset.pov;
    statusEl.textContent = `${button.textContent} view`;
  });

  speedSlider.addEventListener("input", () => {
    world.speed = Number(speedSlider.value);
    speedValue.textContent = `${world.speed.toFixed(1)}x`;
  });

  window.addEventListener("keydown", (event) => {
    if (event.key in world.keys) {
      world.keys[event.key] = true;
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key in world.keys) {
      world.keys[event.key] = false;
      event.preventDefault();
    }
  });
}

function updateFps(rawDelta) {
  world.fps.frames += 1;
  world.fps.elapsed += rawDelta;

  if (world.fps.elapsed >= 0.35) {
    fpsLabel.textContent = `FPS: ${Math.round(world.fps.frames / world.fps.elapsed)}`;
    world.fps.frames = 0;
    world.fps.elapsed = 0;
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  const rawDelta = Math.min(clock.getDelta(), 0.08);
  const delta = Math.min(rawDelta * world.speed, 0.12);
  updateFps(rawDelta);
  updateTrain(delta);
  updateBumperCars(delta);
  updateFerris(delta);
  updateEnvironment(delta);
  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

addLights();
createBase();
createCoaster();
createFerrisWheel();
createBumperCars();
createParkBuildings();
createTreesAndLamps();
createWeatherParticles();
applySetting("day");
bindControls();
window.addEventListener("resize", onResize);
animate();
