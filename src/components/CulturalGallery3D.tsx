"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════
   DATOS DE LA GALERÍA — Identidad Colombiana
   ═══════════════════════════════════════════════ */
const GALLERY_ITEMS = [
  {
    image: "/images/gallery/dove_peace.png",
    title: "La Paloma de la Paz",
    subtitle: "Símbolo universal de reconciliación",
    color: "#f0f4ff",
    emissive: "#4dabf7",
    position: [-4.2, 0.8, 0] as [number, number, number],
    rotation: [0, 0.3, 0] as [number, number, number],
  },
  {
    image: "/images/gallery/palenquera.png",
    title: "La Palenquera",
    subtitle: "Orgullo afrocolombiano",
    color: "#fff3e0",
    emissive: "#ff9800",
    position: [-1.8, 1.0, -1] as [number, number, number],
    rotation: [0, 0.15, 0] as [number, number, number],
  },
  {
    image: "/images/gallery/cano_cristales.png",
    title: "Caño Cristales",
    subtitle: "El río de los 7 colores",
    color: "#e0f7fa",
    emissive: "#e91e63",
    position: [0.5, 0.5, -0.5] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
  {
    image: "/images/gallery/valle_cocora.png",
    title: "Valle del Cocora",
    subtitle: "Palmas de cera y niebla mágica",
    color: "#e8f5e9",
    emissive: "#4caf50",
    position: [2.8, 0.9, -1] as [number, number, number],
    rotation: [0, -0.15, 0] as [number, number, number],
  },
  {
    image: "/images/gallery/condor_andes.png",
    title: "El Cóndor",
    subtitle: "Majestuosidad de los Andes",
    color: "#fce4ec",
    emissive: "#9c27b0",
    position: [5, 0.7, 0] as [number, number, number],
    rotation: [0, -0.3, 0] as [number, number, number],
  },
];

/* ═══════════════════════════════════════════════
   TARJETA FLOTANTE 3D
   ═══════════════════════════════════════════════ */
function FloatingCard({
  image,
  title,
  subtitle,
  color,
  emissive,
  position,
  rotation,
  index,
}: {
  image: string;
  title: string;
  subtitle: string;
  color: string;
  emissive: string;
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, image);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + index * 1.8;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.12;
    groupRef.current.rotation.y = rotation[1] + Math.sin(t * 0.25) * 0.04;

    const s = hovered ? 1.1 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.06);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Card body */}
      <mesh castShadow>
        <boxGeometry args={[2, 2.8, 0.08]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.12}
          metalness={0.05}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          emissive={hovered ? emissive : "#000000"}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>

      {/* Image */}
      <mesh position={[0, 0.2, 0.045]}>
        <planeGeometry args={[1.7, 1.9]} />
        <meshStandardMaterial map={texture} roughness={0.4} />
      </mesh>

      {/* Title label via HTML overlay */}
      <Html
        position={[0, -1.6, 0.1]}
        center
        distanceFactor={5}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div style={{ textAlign: "center", width: "160px" }}>
          <p
            style={{
              color: "#fff",
              fontSize: "13px",
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              textShadow: "0 2px 12px rgba(0,0,0,0.9)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "10px",
              fontWeight: 500,
              marginTop: "3px",
            }}
          >
            {subtitle}
          </p>
        </div>
      </Html>

      {/* Glow behind card on hover */}
      {hovered && (
        <mesh position={[0, 0, -0.06]}>
          <planeGeometry args={[2.6, 3.4]} />
          <meshBasicMaterial
            color={emissive}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   PARTÍCULAS — Luciérnagas / Polvo Mágico
   ═══════════════════════════════════════════════ */
function MagicParticles({ count = 300 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, particleColors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [1, 0.84, 0],
      [0, 0.85, 0.55],
      [0.3, 0.7, 1],
      [1, 0.4, 0.7],
      [0.6, 0.35, 1],
      [1, 0.6, 0.2],
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = Math.random() * 7 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.012;
    const arr = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] +=
        Math.sin(state.clock.elapsedTime * 0.3 + i * 0.5) * 0.0008;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particleColors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        transparent
        opacity={0.75}
        vertexColors
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════
   SUELO oscuro con reflejo sutil
   ═══════════════════════════════════════════════ */
function DarkFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.2, 0]}
      receiveShadow
    >
      <planeGeometry args={[40, 25]} />
      <meshStandardMaterial
        color="#060612"
        roughness={0.8}
        metalness={0.3}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════
   CAMERA CINEMATIC RIG
   ═══════════════════════════════════════════════ */
function CameraRig() {
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Follow pointer smoothly
    vec.set(
      state.pointer.x * 2,
      1 + state.pointer.y * 0.6,
      5.5 + Math.sin(t * 0.15) * 0.15
    );
    state.camera.position.lerp(vec, 0.025);
    state.camera.lookAt(0.3, 0.6, -1);
  });
  return null;
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════ */
export default function CulturalGallery3D() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-[#050510]">
      <Canvas
        shadows
        camera={{ position: [0, 1, 5.5], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={["#050510", 6, 20]} />

        {/* Lighting */}
        <ambientLight intensity={0.25} color="#c4b5fd" />
        <spotLight
          position={[0, 8, 4]}
          angle={0.6}
          penumbra={0.8}
          intensity={3}
          color="#ffe4b5"
          castShadow
        />

        {/* Colombian flag accent lights */}
        <pointLight position={[-6, 4, -2]} intensity={1.2} color="#ffd700" distance={15} />
        <pointLight position={[6, 4, -2]} intensity={0.8} color="#003893" distance={15} />
        <pointLight position={[0, 5, -5]} intensity={0.6} color="#ce1126" distance={12} />

        {/* Rim lights */}
        <pointLight position={[-4, 0.5, 5]} intensity={0.4} color="#4ecdc4" distance={10} />
        <pointLight position={[4, 0.5, 5]} intensity={0.4} color="#ff6b9d" distance={10} />

        {/* Gallery cards */}
        {GALLERY_ITEMS.map((item, i) => (
          <FloatingCard key={i} {...item} index={i} />
        ))}

        {/* Magic particles */}
        <MagicParticles count={300} />

        {/* Dark floor */}
        <DarkFloor />

        {/* Camera */}
        <CameraRig />

        {/* Environment */}
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
