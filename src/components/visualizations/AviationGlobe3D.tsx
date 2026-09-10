import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Radio, RefreshCw } from 'lucide-react';

interface HubData {
  code: string;
  name: string;
  lat: number;
  lon: number;
  fare: string;
  trend: string;
}

const INDIAN_HUBS: HubData[] = [
  { code: 'DEL', name: 'Delhi (IGI)', lat: 28.5562, lon: 77.1000, fare: '₹5,240', trend: '+1.8%' },
  { code: 'BOM', name: 'Mumbai (CSMIA)', lat: 19.0896, lon: 72.8656, fare: '₹4,380', trend: '-2.1%' },
  { code: 'BLR', name: 'Bengaluru (KIA)', lat: 13.1986, lon: 77.7066, fare: '₹3,650', trend: '+0.5%' },
  { code: 'HYD', name: 'Hyderabad (RGIA)', lat: 17.2403, lon: 78.4294, fare: '₹3,190', trend: '-1.4%' },
  { code: 'CCU', name: 'Kolkata (NSCBIA)', lat: 22.6547, lon: 88.4467, fare: '₹4,890', trend: '+3.2%' },
  { code: 'MAA', name: 'Chennai (MAA)', lat: 12.9941, lon: 80.1709, fare: '₹3,920', trend: '-0.8%' },
  { code: 'GOI', name: 'Goa (Dabolim)', lat: 15.3800, lon: 73.8314, fare: '₹4,750', trend: '+2.0%' },
];

const FLIGHT_ROUTES = [
  { from: 'DEL', to: 'BOM', speed: 0.0035 },
  { from: 'BOM', to: 'BLR', speed: 0.0042 },
  { from: 'DEL', to: 'BLR', speed: 0.0030 },
  { from: 'DEL', to: 'CCU', speed: 0.0038 },
  { from: 'HYD', to: 'BLR', speed: 0.0048 },
];

// Helper: Convert Lat/Lon to 3D Cartesian coordinates on sphere of given radius
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Helper: Create procedural stylized Earth texture
function createEarthCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep twilight ocean base
  ctx.fillStyle = '#040E26';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle latitude & longitude grid lines
  ctx.strokeStyle = 'rgba(23, 136, 255, 0.12)';
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

  // Stylized landmass / subcontinent glow representation around India (approx x: 700-760, y: 150-240)
  const grad = ctx.createRadialGradient(720, 195, 10, 720, 195, 120);
  grad.addColorStop(0, 'rgba(0, 210, 255, 0.35)');
  grad.addColorStop(0.5, 'rgba(23, 136, 255, 0.18)');
  grad.addColorStop(1, 'rgba(4, 14, 38, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(720, 195, 120, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// Helper: Create 3D Jet Aircraft Mesh
function createJetMesh(): THREE.Group {
  const jet = new THREE.Group();

  // Fuselage
  const fuselageGeo = new THREE.ConeGeometry(0.04, 0.22, 8);
  fuselageGeo.rotateX(Math.PI / 2);
  const fuselageMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  jet.add(fuselage);

  // Wings
  const wingGeo = new THREE.BoxGeometry(0.26, 0.008, 0.08);
  const wingMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.set(0, 0, -0.02);
  jet.add(wings);

  // Vertical Tailfin
  const tailGeo = new THREE.BoxGeometry(0.01, 0.08, 0.05);
  const tail = new THREE.Mesh(tailGeo, wingMat);
  tail.position.set(0, 0.04, -0.09);
  jet.add(tail);

  return jet;
}

export function AviationGlobe3D({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHub, setSelectedHub] = useState<HubData>(INDIAN_HUBS[0]);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x090A0F, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Starfield Particle Background
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 40;
      starCoords[i + 1] = (Math.random() - 0.5) * 40;
      starCoords[i + 2] = (Math.random() - 0.5) * 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x60A5FA, size: 0.05, transparent: true, opacity: 0.6 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 3. Earth Globe Sphere
    const globeRadius = 1.95;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthCanvas = createEarthCanvas();
    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.05,
      specular: new THREE.Color(0x1788FF),
      shininess: 15,
      emissive: new THREE.Color(0x020817),
      emissiveIntensity: 0.8,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    // Initial rotation to center on India
    globe.rotation.y = -1.8;
    globe.rotation.x = 0.3;
    scene.add(globe);

    // Atmosphere Halo
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.05, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.9);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x38BDF8, 1.4);
    dirLight.position.set(5, 4, 3);
    scene.add(dirLight);

    // 4. Hub Beacons
    const hubMarkersGroup = new THREE.Group();
    globe.add(hubMarkersGroup);

    INDIAN_HUBS.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, globeRadius);

      // Core beacon dot
      const markerGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      hubMarkersGroup.add(marker);

      // Radar Ring
      const ringGeo = new THREE.RingGeometry(0.05, 0.08, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1788FF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos.clone().multiplyScalar(1.005));
      ring.lookAt(pos.clone().multiplyScalar(2));
      hubMarkersGroup.add(ring);
    });

    // 5. Great Circle Flight Arcs & 3D Cruising Jets
    interface ActiveFlight {
      curve: THREE.QuadraticBezierCurve3;
      jet: THREE.Group;
      progress: number;
      speed: number;
    }

    const activeFlights: ActiveFlight[] = [];

    FLIGHT_ROUTES.forEach((route) => {
      const hubA = INDIAN_HUBS.find(h => h.code === route.from);
      const hubB = INDIAN_HUBS.find(h => h.code === route.to);
      if (!hubA || !hubB) return;

      const pA = latLonToVector3(hubA.lat, hubA.lon, globeRadius);
      const pB = latLonToVector3(hubB.lat, hubB.lon, globeRadius);

      // Apex mid-point elevated above globe surface for realistic suborbital arc
      const midPoint = pA.clone().add(pB).multiplyScalar(0.5);
      const arcHeight = pA.distanceTo(pB) * 0.35;
      midPoint.normalize().multiplyScalar(globeRadius + Math.max(0.25, arcHeight));

      const curve = new THREE.QuadraticBezierCurve3(pA, midPoint, pB);
      const points = curve.getPoints(50);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.7,
      });
      const flightLine = new THREE.Line(lineGeo, lineMat);
      globe.add(flightLine);

      // Add cruising 3D jet
      const jet = createJetMesh();
      globe.add(jet);

      activeFlights.push({
        curve,
        jet,
        progress: Math.random(),
        speed: route.speed,
      });
    });

    // 6. Interactive Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globe.rotation.y += deltaX * 0.005;
      globe.rotation.x = Math.max(-1.0, Math.min(1.0, globe.rotation.x + deltaY * 0.005));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle atmospheric auto-rotation if idle
      if (!isDragging && isRotating) {
        globe.rotation.y += 0.0012;
      }

      // Update 3D Jets along Great-Circle Curves
      activeFlights.forEach((flight) => {
        flight.progress += flight.speed;
        if (flight.progress > 1) flight.progress = 0;

        const currentPos = flight.curve.getPointAt(flight.progress);
        flight.jet.position.copy(currentPos);

        const tangent = flight.curve.getTangentAt(flight.progress).normalize();
        const lookTarget = currentPos.clone().add(tangent);
        flight.jet.lookAt(lookTarget);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);

      globeGeo.dispose();
      globeMat.dispose();
      earthTexture.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };
  }, [isRotating]);

  return (
    <div className={`relative w-full h-[360px] bg-[#090A0F] rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl select-none ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#12141C]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.08] pointer-events-auto">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white tracking-wide">3D Aviation Globe</span>
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className="p-2 rounded-xl bg-[#12141C]/85 backdrop-blur-md border border-white/[0.08] text-zinc-300 hover:text-white hover:border-cyan-500/40 pointer-events-auto transition-colors cursor-pointer"
          title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
        >
          <RefreshCw size={13} className={isRotating ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Bottom Hub Cards & Live Status */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[70%] scrollbar-none pointer-events-auto">
          {INDIAN_HUBS.slice(0, 4).map((hub) => (
            <button
              key={hub.code}
              onClick={() => setSelectedHub(hub)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                selectedHub.code === hub.code
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                  : 'bg-[#12141C]/80 text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {hub.code}
            </button>
          ))}
        </div>

        <div className="bg-[#12141C]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.08] text-right pointer-events-auto">
          <div className="text-[10px] text-zinc-400">{selectedHub.name}</div>
          <div className="text-xs font-bold text-cyan-300 flex items-center justify-end gap-1">
            <span>{selectedHub.fare}</span>
            <span className={selectedHub.trend.startsWith('+') ? 'text-emerald-400' : 'text-blue-400'}>
              {selectedHub.trend}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
