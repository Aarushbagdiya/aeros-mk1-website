import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   MorphCanvas3D — Three.js WebGL morph animation
   ═══════════════════════════════════════════════════════════════
   Renders the GARUDA MK-1 drone-to-rover transformation
   in full 3D with:
   • Dark tactical environment + grid floor
   • 4 lattice truss arms with pivot animation
   • Wheel-motor assemblies (tyre ring + spokes + hub)
   • Propeller blades inside each ring
   • Amber → teal lighting transitions
   • Slow camera orbit
   ═════════════════════════════════════════════════════════════ */

/* ── Geometry constants (meters, scaled for scene) ── */
const BODY_W = 0.32;   // 32 cm body width
const BODY_D = 0.40;   // 40 cm body depth
const BODY_H = 0.07;   // 7 cm body height
const ARM_LEN = 0.22;  // arm length shoulder-to-hub
const WHEEL_R = 0.14;  // 28cm diameter = 14cm radius
const TYRE_TUBE = 0.025; // tyre tube radius
const SPOKE_COUNT = 5;
const PROP_LEN = 0.11;  // propeller blade length

/* ── Colors ── */
const COL_BODY = 0x1a1a2e;
const COL_ARM = 0x2a2a3a;
const COL_AMBER = 0xf59e0b;
const COL_TEAL = 0x2dd4bf;
const COL_GROUND = 0x070906; // Very dark green-black base
const COL_GRID = 0x586b45;   // camo-light

/* ── Helper: create a lattice truss arm ── */
function createTrussArm(length) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: COL_ARM,
    metalness: 0.7,
    roughness: 0.35,
  });

  // Main beam (two parallel rails)
  const railGeo = new THREE.CylinderGeometry(0.006, 0.006, length, 6);
  railGeo.rotateZ(Math.PI / 2);
  const offsetY = 0.015;

  const rail1 = new THREE.Mesh(railGeo, mat);
  rail1.position.set(length / 2, offsetY, 0.008);
  group.add(rail1);

  const rail2 = new THREE.Mesh(railGeo, mat);
  rail2.position.set(length / 2, offsetY, -0.008);
  group.add(rail2);

  const rail3 = new THREE.Mesh(railGeo, mat);
  rail3.position.set(length / 2, -offsetY, 0);
  group.add(rail3);

  // Cross braces
  const braceGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.04, 4);
  const braceCount = 6;
  for (let i = 0; i < braceCount; i++) {
    const t = (i + 0.5) / braceCount;
    const brace = new THREE.Mesh(braceGeo, mat);
    brace.position.set(t * length, 0, 0);
    brace.rotation.x = Math.PI / 4 + (i % 2) * Math.PI / 2;
    group.add(brace);
  }

  return group;
}

/* ── Helper: create wheel-motor assembly ── */
function createWheelAssembly() {
  const group = new THREE.Group();

  // Tyre ring (torus)
  const tyreGeo = new THREE.TorusGeometry(WHEEL_R, TYRE_TUBE, 12, 48);
  const tyreMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.1,
    roughness: 0.9,
  });
  const tyre = new THREE.Mesh(tyreGeo, tyreMat);
  tyre.name = "tyre";
  group.add(tyre);

  // Tread bumps
  const bumpGeo = new THREE.SphereGeometry(0.006, 4, 4);
  const bumpMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.95 });
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const bump = new THREE.Mesh(bumpGeo, bumpMat);
    bump.position.set(
      Math.cos(angle) * (WHEEL_R + TYRE_TUBE * 0.7),
      Math.sin(angle) * (WHEEL_R + TYRE_TUBE * 0.7),
      0
    );
    group.add(bump);
  }

  // Spokes
  const spokeMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a4a,
    metalness: 0.6,
    roughness: 0.3,
  });
  for (let i = 0; i < SPOKE_COUNT; i++) {
    const angle = (i / SPOKE_COUNT) * Math.PI * 2;
    const spokeGeo = new THREE.CylinderGeometry(0.005, 0.005, WHEEL_R - 0.025, 6);
    spokeGeo.rotateZ(Math.PI / 2);
    const spoke = new THREE.Mesh(spokeGeo, spokeMat);
    spoke.position.set(
      Math.cos(angle) * (WHEEL_R / 2 + 0.01),
      Math.sin(angle) * (WHEEL_R / 2 + 0.01),
      0
    );
    spoke.rotation.z = angle;
    group.add(spoke);
  }

  // Hub motor (centre disc)
  const hubGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.025, 24);
  hubGeo.rotateX(Math.PI / 2);
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0x0e0e1a,
    metalness: 0.8,
    roughness: 0.2,
    emissive: COL_AMBER,
    emissiveIntensity: 0.3,
  });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.name = "hub";
  group.add(hub);

  // Hub glow ring
  const glowRingGeo = new THREE.TorusGeometry(0.032, 0.003, 8, 32);
  const glowRingMat = new THREE.MeshStandardMaterial({
    color: COL_AMBER,
    emissive: COL_AMBER,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.7,
  });
  const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
  glowRing.name = "hubGlow";
  group.add(glowRing);

  // Propeller blades (3 blades inside the ring)
  const propGroup = new THREE.Group();
  propGroup.name = "propeller";
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a3a,
    metalness: 0.5,
    roughness: 0.4,
    transparent: true,
    opacity: 0.85,
  });
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(PROP_LEN, 0.012);
    bladeShape.lineTo(PROP_LEN, -0.005);
    bladeShape.lineTo(0, -0.002);
    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.003,
      bevelEnabled: false,
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.rotation.z = angle;
    blade.position.z = -0.0015;
    propGroup.add(blade);
  }
  group.add(propGroup);

  return group;
}

/* ── Main component ── */
export default function MorphCanvas3D({ progress = 0 }) {
  const containerRef = useRef(null);
  const sceneData = useRef(null);

  /* Build the scene once */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(COL_GROUND, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(COL_GROUND, 0.8);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      40,
      rect.width / rect.height,
      0.01,
      50
    );
    camera.position.set(0.7, 0.45, 0.7);
    camera.lookAt(0, 0.1, 0);

    // ── Lighting ──
    // Ambient
    const ambient = new THREE.AmbientLight(0x404050, 0.4);
    scene.add(ambient);

    // Key light (cool white rim)
    const keyLight = new THREE.DirectionalLight(0xddeeff, 1.2);
    keyLight.position.set(2, 3, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x334455, 0.4);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);

    // Amber accent point lights at motor hubs (added to pivots later)
    const hubLights = [];
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(COL_AMBER, 0.6, 0.5);
      light.name = `hubLight${i}`;
      hubLights.push(light);
      scene.add(light);
    }

    // ── Grid floor ──
    const gridHelper = new THREE.GridHelper(4, 80, COL_GRID, COL_GRID);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.06;
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Ground plane (for shadows)
    const groundGeo = new THREE.PlaneGeometry(6, 6);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // ── Build drone ──
    const droneGroup = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(BODY_W, BODY_H, BODY_D);
    // Rounded edge via chamfer approximation
    const bodyMat = new THREE.MeshStandardMaterial({
      color: COL_BODY,
      metalness: 0.3,
      roughness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.name = "body";
    droneGroup.add(body);

    // Body edge highlight
    const edgesGeo = new THREE.EdgesGeometry(bodyGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: COL_AMBER,
      transparent: true,
      opacity: 0.25,
    });
    const bodyEdges = new THREE.LineSegments(edgesGeo, edgesMat);
    body.add(bodyEdges);

    // Camera dome on bottom
    const domeGeo = new THREE.SphereGeometry(0.025, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a1a,
      emissive: COL_TEAL,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.1,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.rotation.x = Math.PI;
    dome.position.set(0, -BODY_H / 2, BODY_D * 0.3);
    droneGroup.add(dome);

    // ── 4 arm-pivot groups ──
    // Each pivot is at a corner of the body. The arm extends outward,
    // and the pivot rotates around its local X axis (lateral) to swing down.
    const armAngles = [
      { x: -BODY_W / 2, z: -BODY_D / 2, rotY: Math.PI + Math.PI / 4 },   // rear-left
      { x: BODY_W / 2,  z: -BODY_D / 2, rotY: -Math.PI / 4 },            // rear-right
      { x: -BODY_W / 2, z: BODY_D / 2,  rotY: Math.PI - Math.PI / 4 },   // front-left
      { x: BODY_W / 2,  z: BODY_D / 2,  rotY: Math.PI / 4 },             // front-right
    ];

    const pivots = [];
    const wheels = [];

    armAngles.forEach((cfg, i) => {
      // Pivot group — positioned at body corner
      const pivotGroup = new THREE.Group();
      pivotGroup.position.set(cfg.x, 0, cfg.z);
      pivotGroup.rotation.y = cfg.rotY;
      pivotGroup.name = `pivot${i}`;

      // Arm mesh inside pivot
      const arm = createTrussArm(ARM_LEN);
      pivotGroup.add(arm);

      // Wheel assembly at arm tip
      const wheel = createWheelAssembly();
      wheel.position.set(ARM_LEN, 0, 0);
      // Wheel faces sideways (perpendicular to arm)
      wheel.rotation.y = Math.PI / 2;
      wheel.name = `wheel${i}`;
      pivotGroup.add(wheel);

      // Shoulder joint ring
      const jointGeo = new THREE.TorusGeometry(0.015, 0.004, 8, 16);
      jointGeo.rotateY(Math.PI / 2);
      const jointMat = new THREE.MeshStandardMaterial({
        color: COL_AMBER,
        emissive: COL_AMBER,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2,
      });
      const joint = new THREE.Mesh(jointGeo, jointMat);
      pivotGroup.add(joint);

      droneGroup.add(pivotGroup);
      pivots.push(pivotGroup);
      wheels.push(wheel);
    });

    // Position drone above ground
    droneGroup.position.y = 0.35; // flight altitude
    scene.add(droneGroup);

    // ── Resize handler ──
    const onResize = () => {
      const r = container.getBoundingClientRect();
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
    };
    window.addEventListener("resize", onResize);

    // Store refs
    sceneData.current = {
      renderer,
      scene,
      camera,
      droneGroup,
      pivots,
      wheels,
      hubLights,
      body,
    };

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  /* Update animation on every progress change */
  useEffect(() => {
    if (!sceneData.current) return;
    const { renderer, scene, camera, droneGroup, pivots, wheels, hubLights } =
      sceneData.current;

    const p = Math.max(0, Math.min(1, progress));
    const armAngleRad = (p * 90 * Math.PI) / 180; // 0 → π/2

    // ── Arm pivot rotation ──
    // In flight (p=0): arms extend horizontally (rotation.z = 0)
    // In rover (p=1): arms point down (rotation.z = -π/2)
    pivots.forEach((pivot) => {
      pivot.rotation.z = -armAngleRad;
    });

    // ── Body height ──
    // Flight: 0.35m above ground
    // Rover: wheels touch ground, body at ~ARM_LEN + WHEEL_R above
    const flightY = 0.35;
    const roverY = ARM_LEN + WHEEL_R + BODY_H / 2 + 0.01;
    // Smooth interpolation
    const easedP = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    droneGroup.position.y = flightY + (roverY - flightY) * easedP;

    // ── Propeller spin ──
    const propSpeed = Math.max(0, 1 - p * 2.5); // fades out by p=0.4
    wheels.forEach((wheel) => {
      const prop = wheel.getObjectByName("propeller");
      if (prop) {
        prop.rotation.z += propSpeed * 0.35;
        // Fade prop opacity
        prop.children.forEach((blade) => {
          if (blade.material) {
            blade.material.opacity = 0.3 + propSpeed * 0.55;
          }
        });
      }
    });

    // ── Hub light color transition ──
    // Flight: amber → Morph: white → Rover: teal
    const amberColor = new THREE.Color(COL_AMBER);
    const tealColor = new THREE.Color(COL_TEAL);
    const whiteColor = new THREE.Color(0xffffff);

    let hubColor;
    if (p < 0.25) {
      hubColor = amberColor;
    } else if (p < 0.5) {
      const t = (p - 0.25) / 0.25;
      hubColor = amberColor.clone().lerp(whiteColor, t);
    } else if (p < 0.75) {
      const t = (p - 0.5) / 0.25;
      hubColor = whiteColor.clone().lerp(tealColor, t);
    } else {
      hubColor = tealColor;
    }

    // Update hub glow materials and lights
    wheels.forEach((wheel, i) => {
      const hubGlow = wheel.getObjectByName("hubGlow");
      if (hubGlow) {
        hubGlow.material.emissive = hubColor;
        hubGlow.material.color = hubColor;
      }
      const hub = wheel.getObjectByName("hub");
      if (hub) {
        hub.material.emissive = hubColor;
        hub.material.emissiveIntensity = 0.3 + p * 0.3;
      }
    });

    // Update point lights at hub positions
    pivots.forEach((pivot, i) => {
      const worldPos = new THREE.Vector3();
      const wheelInPivot = pivot.children.find((c) => c.name === `wheel${i}`);
      if (wheelInPivot) {
        wheelInPivot.getWorldPosition(worldPos);
        hubLights[i].position.copy(worldPos);
      }
      hubLights[i].color = hubColor;
      hubLights[i].intensity = 0.4 + p * 0.4;
    });

    // ── Camera orbit ──
    const time = Date.now() * 0.0002;
    const camRadius = 0.9;
    const camHeight = 0.35 + p * 0.1;
    camera.position.x = Math.cos(time) * camRadius;
    camera.position.z = Math.sin(time) * camRadius;
    camera.position.y = camHeight;
    camera.lookAt(0, droneGroup.position.y * 0.6, 0);

    // Render
    renderer.render(scene, camera);

    // Request next frame for continuous orbit
    const frameId = requestAnimationFrame(() => {
      if (sceneData.current) {
        renderer.render(scene, camera);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [progress]);

  /* Continuous render loop for smooth camera orbit + prop spin */
  useEffect(() => {
    if (!sceneData.current) return;
    let running = true;

    const loop = () => {
      if (!running || !sceneData.current) return;
      const { renderer, scene, camera, droneGroup, wheels } = sceneData.current;

      // Camera orbit
      const time = Date.now() * 0.00015;
      const camRadius = 0.85;
      camera.position.x = Math.cos(time) * camRadius;
      camera.position.z = Math.sin(time) * camRadius;
      camera.lookAt(0, droneGroup.position.y * 0.55, 0);

      // Prop spin (continuous)
      const p = progress;
      const propSpeed = Math.max(0, 1 - p * 2.5);
      wheels.forEach((wheel) => {
        const prop = wheel.getObjectByName("propeller");
        if (prop && propSpeed > 0) {
          prop.rotation.z += propSpeed * 0.12;
        }
      });

      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      running = false;
    };
  }, [progress]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "100%" }}
    />
  );
}
