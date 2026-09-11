import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Radio, RotateCw, ZoomIn, ZoomOut, Compass, 
  Layers, Eye, EyeOff
} from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export interface SectorHubData {
  id: string; // 'North' | 'West' | 'South' | 'East' | 'Central'
  code: string;
  name: string;
  sectorName: string;
  lat: number;
  lon: number;
  color: string;
  hexColor: number;
  defaultVal: number;
  defaultChange: number;
  avgFare: string;
  routes: string;
  dominantAirline: string;
}

export const SECTOR_HUBS: SectorHubData[] = [
  { 
    id: 'North', 
    code: 'DEL', 
    name: 'Delhi (IGI)', 
    sectorName: 'Northern Sector', 
    lat: 28.5562, 
    lon: 77.1000, 
    color: '#00E5FF', 
    hexColor: 0x00E5FF, 
    defaultVal: 134.8, 
    defaultChange: 2.4, 
    avgFare: '₹5,840', 
    routes: 'DEL-BOM, DEL-BLR, DEL-GOI',
    dominantAirline: 'IndiGo / Air India'
  },
  { 
    id: 'West', 
    code: 'BOM', 
    name: 'Mumbai (CSMIA)', 
    sectorName: 'Western Sector', 
    lat: 19.0896, 
    lon: 72.8656, 
    color: '#38BDF8', 
    hexColor: 0x38BDF8, 
    defaultVal: 138.2, 
    defaultChange: 1.9, 
    avgFare: '₹5,120', 
    routes: 'BOM-BLR, BOM-GOI, BOM-DEL',
    dominantAirline: 'IndiGo / Akasa Air'
  },
  { 
    id: 'South', 
    code: 'BLR', 
    name: 'Bengaluru / MAA', 
    sectorName: 'Southern Sector', 
    lat: 13.1986, 
    lon: 77.7066, 
    color: '#10B981', 
    hexColor: 0x10B981, 
    defaultVal: 142.1, 
    defaultChange: 3.6, 
    avgFare: '₹4,690', 
    routes: 'BLR-BOM, MAA-DEL, BLR-HYD',
    dominantAirline: 'IndiGo / SpiceJet'
  },
  { 
    id: 'East', 
    code: 'CCU', 
    name: 'Kolkata (NSCBIA)', 
    sectorName: 'Eastern Sector', 
    lat: 22.6547, 
    lon: 88.4467, 
    color: '#F59E0B', 
    hexColor: 0xF59E0B, 
    defaultVal: 126.5, 
    defaultChange: 1.5, 
    avgFare: '₹4,350', 
    routes: 'CCU-DEL, CCU-BLR, CCU-GAU',
    dominantAirline: 'IndiGo / AI Express'
  },
  { 
    id: 'Central', 
    code: 'HYD', 
    name: 'Hyderabad (RGIA)', 
    sectorName: 'Central Sector', 
    lat: 17.2403, 
    lon: 78.4294, 
    color: '#A855F7', 
    hexColor: 0xA855F7, 
    defaultVal: 128.4, 
    defaultChange: -0.8, 
    avgFare: '₹4,120', 
    routes: 'HYD-DEL, HYD-BLR, HYD-BOM',
    dominantAirline: 'IndiGo / Vistara'
  },
];

const FLIGHT_CORRIDORS = [
  { from: 'DEL', to: 'BOM', speed: 0.0035, color: 0x00E5FF },
  { from: 'BOM', to: 'BLR', speed: 0.0042, color: 0x38BDF8 },
  { from: 'DEL', to: 'BLR', speed: 0.0030, color: 0x10B981 },
  { from: 'DEL', to: 'CCU', speed: 0.0038, color: 0xF59E0B },
  { from: 'HYD', to: 'DEL', speed: 0.0044, color: 0xA855F7 },
  { from: 'HYD', to: 'BLR', speed: 0.0048, color: 0x00E5FF },
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function createEarthCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(23, 136, 255, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  const indiaX = (78.96 / 360 + 0.5) * canvas.width;
  const indiaY = (0.5 - 20.59 / 180) * canvas.height;

  const grad = ctx.createRadialGradient(indiaX, indiaY, 15, indiaX, indiaY, 260);
  grad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
  grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.22)');
  grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.12)');
  grad.addColorStop(1, 'rgba(6, 9, 19, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(indiaX, indiaY, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(23, 136, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(indiaX - 80, indiaY - 100);
  ctx.lineTo(indiaX + 110, indiaY - 90);
  ctx.lineTo(indiaX + 40, indiaY + 120);
  ctx.lineTo(indiaX - 40, indiaY + 60);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

function createJetMesh(colorHex: number = 0x00E5FF): THREE.Group {
  const jet = new THREE.Group();

  const fuselageGeo = new THREE.ConeGeometry(0.038, 0.2, 8);
  fuselageGeo.rotateX(Math.PI / 2);
  const fuselageMat = new THREE.MeshBasicMaterial({ color: colorHex });
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  jet.add(fuselage);

  const wingGeo = new THREE.BoxGeometry(0.24, 0.006, 0.07);
  const wingMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.set(0, 0, -0.01);
  jet.add(wings);

  const tailGeo = new THREE.BoxGeometry(0.008, 0.07, 0.04);
  const tail = new THREE.Mesh(tailGeo, wingMat);
  tail.position.set(0, 0.035, -0.08);
  jet.add(tail);

  const glowGeo = new THREE.SphereGeometry(0.015, 8, 8);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00F2FE });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, 0, -0.1);
  jet.add(glow);

  return jet;
}

export interface AviationGlobe3DProps {
  className?: string;
  activeRegion?: string;
  onSelectRegion?: (regionId: string) => void;
  regionalData?: Array<{ region: string; value: number; change: number }>;
}

export function AviationGlobe3D({
  className = '',
  activeRegion = 'North',
  onSelectRegion,
  regionalData = []
}: AviationGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [showTowers, setShowTowers] = useState(true);
  const [showArcs, setShowArcs] = useState(true);
  const [hoveredHub, setHoveredHub] = useState<SectorHubData | null>(null);

  const globeRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const towersGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef<{ y: number; x: number } | null>(null);

  const getRegionValue = useCallback((regionId: string) => {
    if (Array.isArray(regionalData) && regionalData.length > 0) {
      const found = regionalData.find(r => r.region.toLowerCase() === regionId.toLowerCase());
      if (found) return { value: found.value, change: found.change };
    }
    const fallback = SECTOR_HUBS.find(h => h.id === regionId);
    return { value: fallback?.defaultVal ?? 134.8, change: fallback?.defaultChange ?? 2.4 };
  }, [regionalData]);

  const focusOnHub = useCallback((hub: SectorHubData) => {
    const targetY = - (hub.lon * (Math.PI / 180)) - 0.45;
    const targetX = (hub.lat * (Math.PI / 180)) * 0.45;
    targetRotationRef.current = { y: targetY, x: targetX };
  }, []);

  useEffect(() => {
    const hub = SECTOR_HUBS.find(h => h.id === activeRegion);
    if (hub) {
      focusOnHub(hub);
    }
  }, [activeRegion, focusOnHub]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 5.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setClearColor(0x090A0F, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const starCount = 700;
    const starGeo = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 45;
      starCoords[i + 1] = (Math.random() - 0.5) * 45;
      starCoords[i + 2] = (Math.random() - 0.5) * 45;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x38BDF8, size: 0.045, transparent: true, opacity: 0.55 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    const globeRadius = 1.92;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthCanvas = createEarthCanvas();
    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.05,
      specular: new THREE.Color(0x00E5FF),
      shininess: 24,
      emissive: new THREE.Color(0x020718),
      emissiveIntensity: 0.85,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globe.rotation.y = -1.82;
    globe.rotation.x = 0.32;
    scene.add(globe);
    globeRef.current = globe;

    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.055, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.075,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0x00E5FF, 1.4);
    dirLight1.position.set(5, 4, 3);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x3B82F6, 0.7);
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    const towersGroup = new THREE.Group();
    globe.add(towersGroup);
    towersGroupRef.current = towersGroup;

    const interactiveMeshes: { mesh: THREE.Object3D; hub: SectorHubData }[] = [];
    const animatedRings: { mesh: THREE.Mesh; scaleSpeed: number; maxScale: number }[] = [];

    SECTOR_HUBS.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, globeRadius);
      const normal = pos.clone().normalize();
      const metrics = getRegionValue(hub.id);

      const towerHeight = Math.max(0.18, (metrics.value - 110) * 0.015);
      const cylinderGeo = new THREE.CylinderGeometry(0.024, 0.038, towerHeight, 16);
      const isSelected = hub.id === activeRegion;

      const cylinderMat = new THREE.MeshStandardMaterial({
        color: hub.hexColor,
        emissive: hub.hexColor,
        emissiveIntensity: isSelected ? 1.8 : 0.85,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.75,
        roughness: 0.2,
        metalness: 0.6,
      });

      const pillar = new THREE.Mesh(cylinderGeo, cylinderMat);
      const centerPos = pos.clone().add(normal.clone().multiplyScalar(towerHeight / 2));
      pillar.position.copy(centerPos);
      pillar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      towersGroup.add(pillar);

      const tipPos = pos.clone().add(normal.clone().multiplyScalar(towerHeight));
      const orbGeo = new THREE.SphereGeometry(0.042, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: isSelected ? 0xFFFFFF : hub.hexColor });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.copy(tipPos);
      towersGroup.add(orb);

      const ringGeo = new THREE.RingGeometry(0.05, 0.075, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos.clone().multiplyScalar(1.002));
      ring.lookAt(pos.clone().multiplyScalar(2));
      towersGroup.add(ring);

      animatedRings.push({ mesh: ring, scaleSpeed: 0.008, maxScale: 1.8 });

      interactiveMeshes.push({ mesh: pillar, hub });
      interactiveMeshes.push({ mesh: orb, hub });
    });

    const arcsGroup = new THREE.Group();
    globe.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    interface ActiveFlight {
      curve: THREE.QuadraticBezierCurve3;
      jet: THREE.Group;
      progress: number;
      speed: number;
    }

    const activeFlights: ActiveFlight[] = [];

    FLIGHT_CORRIDORS.forEach((corridor) => {
      const hubA = SECTOR_HUBS.find(h => h.code === corridor.from);
      const hubB = SECTOR_HUBS.find(h => h.code === corridor.to);
      if (!hubA || !hubB) return;

      const pA = latLonToVector3(hubA.lat, hubA.lon, globeRadius);
      const pB = latLonToVector3(hubB.lat, hubB.lon, globeRadius);

      const midPoint = pA.clone().add(pB).multiplyScalar(0.5);
      const arcHeight = pA.distanceTo(pB) * 0.38;
      midPoint.normalize().multiplyScalar(globeRadius + Math.max(0.24, arcHeight));

      const curve = new THREE.QuadraticBezierCurve3(pA, midPoint, pB);
      const points = curve.getPoints(50);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: corridor.color,
        transparent: true,
        opacity: 0.75,
      });
      const flightLine = new THREE.Line(lineGeo, lineMat);
      arcsGroup.add(flightLine);

      const jet = createJetMesh(corridor.color);
      arcsGroup.add(jet);

      activeFlights.push({
        curve,
        jet,
        progress: Math.random(),
        speed: corridor.speed,
      });
    });

    let isDragging = false;
    let dragDistance = 0;
    let previousMousePosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const getCanvasMousePos = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragDistance = 0;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

        globe.rotation.y += deltaX * 0.005;
        globe.rotation.x = Math.max(-0.85, Math.min(0.85, globe.rotation.x + deltaY * 0.005));

        targetRotationRef.current = null;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        const pos = getCanvasMousePos(e);
        mouseVector.set(pos.x, pos.y);
        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObjects(interactiveMeshes.map(m => m.mesh));
        if (intersects.length > 0) {
          const hit = interactiveMeshes.find(m => m.mesh === intersects[0].object);
          if (hit) {
            setHoveredHub(hit.hub);
            renderer.domElement.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredHub(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isDragging && dragDistance < 6) {
        const pos = getCanvasMousePos(e);
        mouseVector.set(pos.x, pos.y);
        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObjects(interactiveMeshes.map(m => m.mesh));
        if (intersects.length > 0) {
          const hit = interactiveMeshes.find(m => m.mesh === intersects[0].object);
          if (hit && onSelectRegion) {
            onSelectRegion(hit.hub.id);
            focusOnHub(hit.hub);
          }
        }
      }
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.0025;
      camera.position.z = Math.max(2.8, Math.min(6.8, camera.position.z + zoomFactor));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (targetRotationRef.current) {
        const deltaY = targetRotationRef.current.y - globe.rotation.y;
        const deltaX = targetRotationRef.current.x - globe.rotation.x;
        globe.rotation.y += deltaY * 0.06;
        globe.rotation.x += deltaX * 0.06;

        if (Math.abs(deltaY) < 0.002 && Math.abs(deltaX) < 0.002) {
          targetRotationRef.current = null;
        }
      } else if (!isDragging && isRotating) {
        globe.rotation.y += 0.001;
      }

      if (showArcs) {
        activeFlights.forEach((flight) => {
          flight.progress += flight.speed;
          if (flight.progress > 1) flight.progress = 0;

          const currentPos = flight.curve.getPointAt(flight.progress);
          flight.jet.position.copy(currentPos);

          const tangent = flight.curve.getTangentAt(flight.progress).normalize();
          flight.jet.lookAt(currentPos.clone().add(tangent));
        });
      }

      animatedRings.forEach((ringItem) => {
        const s = (ringItem.mesh.scale.x + ringItem.scaleSpeed);
        if (s > ringItem.maxScale) {
          ringItem.mesh.scale.set(1, 1, 1);
        } else {
          ringItem.mesh.scale.set(s, s, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      globeGeo.dispose();
      globeMat.dispose();
      earthTexture.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [isRotating, showArcs, showTowers, activeRegion, getRegionValue, focusOnHub, onSelectRegion]);

  useEffect(() => {
    if (towersGroupRef.current) {
      towersGroupRef.current.visible = showTowers;
    }
  }, [showTowers]);

  useEffect(() => {
    if (arcsGroupRef.current) {
      arcsGroupRef.current.visible = showArcs;
    }
  }, [showArcs]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -0.5 : 0.5;
    cameraRef.current.position.z = Math.max(2.8, Math.min(6.8, cameraRef.current.position.z + delta));
  };

  const handleReset = () => {
    if (globeRef.current) {
      targetRotationRef.current = { y: -1.82, x: 0.32 };
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.8, 5.0);
    }
  };

  const selectedHub = SECTOR_HUBS.find(h => h.id === activeRegion) || SECTOR_HUBS[0];
  const selectedMetrics = getRegionValue(selectedHub.id);

  return (
    <div className={`relative w-full h-full min-h-[380px] bg-[#08090E]/30 backdrop-blur-md rounded-2xl overflow-hidden select-none ${className}`}>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-[#0E111A]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.1] shadow-lg">
          <Radio size={13} className="text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-white tracking-wider uppercase">
            3D ORBITAL RADAR
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
            DGCA MESH
          </span>
        </div>

        <div className="text-[9.5px] font-mono text-zinc-400 bg-[#0E111A]/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/[0.06] flex items-center gap-2">
          <span>LAT: <strong className="text-cyan-300">{selectedHub.lat.toFixed(2)}°N</strong></span>
          <span>LON: <strong className="text-cyan-300">{selectedHub.lon.toFixed(2)}°E</strong></span>
          <span className="text-emerald-400 font-bold">ALT: FL380</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          onClick={() => setShowTowers(!showTowers)}
          className={`p-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
            showTowers 
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm' 
              : 'bg-[#0E111A]/80 border-white/[0.08] text-zinc-400 hover:text-white'
          }`}
          title={showTowers ? 'Hide 3D Index Towers' : 'Show 3D Index Towers'}
        >
          <Layers size={13} />
        </button>

        <button
          onClick={() => setShowArcs(!showArcs)}
          className={`p-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
            showArcs 
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm' 
              : 'bg-[#0E111A]/80 border-white/[0.08] text-zinc-400 hover:text-white'
          }`}
          title={showArcs ? 'Hide Flight Arcs' : 'Show Flight Arcs'}
        >
          {showArcs ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
            isRotating 
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm' 
              : 'bg-[#0E111A]/80 border-white/[0.08] text-zinc-400 hover:text-white'
          }`}
          title={isRotating ? 'Pause Rotation' : 'Auto-Rotate'}
        >
          <RotateCw size={13} className={isRotating ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={handleReset}
          className="p-1.5 rounded-xl bg-[#0E111A]/85 backdrop-blur-md border border-white/[0.08] text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
          title="Reset View to India Center"
        >
          <Compass size={13} />
        </button>

        <div className="flex items-center bg-[#0E111A]/85 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden">
          <button
            onClick={() => handleZoom('in')}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <div className="w-[1px] h-3 bg-white/[0.1]" />
          <button
            onClick={() => handleZoom('out')}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
        </div>
      </div>

      {hoveredHub && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#0E111A]/95 border border-cyan-500/50 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] pointer-events-none z-20 flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: hoveredHub.color, boxShadow: `0 0 8px ${hoveredHub.color}` }} 
          />
          <span className="text-xs font-bold text-white">{hoveredHub.sectorName}</span>
          <span className="text-xs font-mono text-cyan-300 font-extrabold">
            Index {getRegionValue(hoveredHub.id).value}
          </span>
          <span className="text-[10px] text-zinc-400">Click to Inspect</span>
        </div>
      )}

      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {SECTOR_HUBS.map((hub) => {
            const metrics = getRegionValue(hub.id);
            const isSelected = hub.id === activeRegion;

            return (
              <button
                key={hub.id}
                onClick={() => {
                  if (onSelectRegion) onSelectRegion(hub.id);
                  focusOnHub(hub);
                }}
                className={`flex-1 min-w-[65px] px-2 py-1 rounded-xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#121624] border-cyan-500/60 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                    : 'bg-[#0E111A]/85 hover:bg-[#141826] border-white/[0.08] text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    {hub.code}
                  </span>
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: hub.color, boxShadow: isSelected ? `0 0 6px ${hub.color}` : 'none' }} 
                  />
                </div>
                <div className="flex items-center gap-1 mt-0.5 font-mono">
                  <span className={`text-[10px] font-extrabold ${isSelected ? 'text-cyan-300' : 'text-zinc-300'}`}>
                    <AnimatedNumber value={metrics.value} format={(v) => v.toFixed(1)} />
                  </span>
                  <span className={`text-[8.5px] ${metrics.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.change >= 0 ? '+' : ''}
                    <AnimatedNumber value={metrics.change} format={(v) => v.toFixed(1)} />%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-[#0C0F17]/95 border border-white/[0.1] backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0"
              style={{ 
                backgroundColor: `${selectedHub.color}20`, 
                color: selectedHub.color, 
                border: `1px solid ${selectedHub.color}40` 
              }}
            >
              {selectedHub.code}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{selectedHub.sectorName}</span>
                <span className="text-[10px] font-mono text-zinc-400">({selectedHub.name})</span>
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                <span>Routes: <strong className="text-zinc-200">{selectedHub.routes}</strong></span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Carrier: <strong className="text-zinc-200">{selectedHub.dominantAirline}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-sm font-mono font-extrabold text-cyan-300 flex items-center justify-end gap-1">
              <span>
                <AnimatedNumber value={selectedMetrics.value} format={(v) => v.toFixed(1)} />
              </span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                selectedMetrics.change >= 0 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {selectedMetrics.change >= 0 ? '+' : ''}
                <AnimatedNumber value={selectedMetrics.change} format={(v) => v.toFixed(1)} />%
              </span>
            </div>
            <div className="text-[9.5px] font-mono text-zinc-400 mt-0.5">
              Sector Yield: <span className="text-white font-semibold">{selectedHub.avgFare}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
