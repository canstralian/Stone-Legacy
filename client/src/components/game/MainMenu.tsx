import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/stores/useGame";

function SmokeParticle({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const initialY = position[1];
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.y = initialY + Math.sin(t + offset) * 0.5 + t * 0.05 % 3;
    ref.current.position.x = position[0] + Math.sin(t * 0.7 + offset) * 0.8;
    ref.current.rotation.z = t * 0.3;
    const scale = 0.3 + Math.sin(t + offset) * 0.15;
    ref.current.scale.setScalar(scale);
    if (ref.current.material instanceof THREE.MeshStandardMaterial) {
      ref.current.material.opacity = 0.15 + Math.sin(t * 0.5 + offset) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
}

function FloatingLeaf({ position, rotSpeed }: { position: [number, number, number]; rotSpeed: number }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * rotSpeed;
    ref.current.rotation.z = Math.sin(t * 0.5 + offset) * 0.3;
    ref.current.position.y = position[1] + Math.sin(t * 0.3 + offset) * 0.5;
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <coneGeometry args={[0.15, 0.4, 5]} />
        <meshStandardMaterial color="#4a7c3f" emissive="#2d5a1e" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export default function MainMenu() {
  const setPhase = useGame((s) => s.setPhase);
  const groupRef = useRef<THREE.Group>(null);

  const smokePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 20; i++) {
      positions.push([
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        -3 - Math.random() * 5,
      ]);
    }
    return positions;
  }, []);

  const leafPositions = useMemo(() => {
    const positions: { pos: [number, number, number]; rot: number }[] = [];
    for (let i = 0; i < 8; i++) {
      positions.push({
        pos: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          -2 - Math.random() * 3,
        ],
        rot: 0.2 + Math.random() * 0.5,
      });
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#D4AF37" />
      <pointLight position={[-5, 3, 2]} intensity={0.5} color="#9370DB" />
      <pointLight position={[5, -2, 3]} intensity={0.4} color="#4a7c3f" />

      {smokePositions.map((pos, i) => (
        <SmokeParticle
          key={i}
          position={pos}
          color={i % 3 === 0 ? "#9370DB" : i % 3 === 1 ? "#4a7c3f" : "#D4AF37"}
          speed={0.3 + Math.random() * 0.4}
        />
      ))}

      {leafPositions.map((leaf, i) => (
        <FloatingLeaf key={i} position={leaf.pos} rotSpeed={leaf.rot} />
      ))}

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <Text
          position={[0, 2, 0]}
          fontSize={1.2}
          color="#D4AF37"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
          outlineWidth={0.05}
          outlineColor="#4A4A4A"
        >
          HIGHER VIBES
        </Text>
      </Float>

      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.3}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.3}
          color="#A8A8A8"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          A Chill Stoner Experience
        </Text>
      </Float>

      <group
        position={[0, -0.5, 0]}
        onClick={() => setPhase("playing")}
        onPointerOver={(e) => {
          document.body.style.cursor = "pointer";
          const mesh = e.object as THREE.Mesh;
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.emissiveIntensity = 0.8;
          }
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = "default";
          const mesh = e.object as THREE.Mesh;
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.emissiveIntensity = 0.3;
          }
        }}
      >
        <mesh>
          <boxGeometry args={[3, 0.8, 0.1]} />
          <meshStandardMaterial color="#4a7c3f" emissive="#4a7c3f" emissiveIntensity={0.3} transparent opacity={0.9} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.35}
          color="#E8DCC4"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          START SESSION
        </Text>
      </group>

      <group
        position={[0, -1.5, 0]}
        onClick={() => setPhase("collection")}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <mesh>
          <boxGeometry args={[3, 0.6, 0.1]} />
          <meshStandardMaterial color="#9370DB" emissive="#9370DB" emissiveIntensity={0.2} transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.25}
          color="#E8DCC4"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          STRAIN COLLECTION
        </Text>
      </group>

      <group
        position={[0, -2.3, 0]}
        onClick={() => setPhase("gallery")}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <mesh>
          <boxGeometry args={[3, 0.6, 0.1]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.2} transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.25}
          color="#4A4A4A"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          VIBE GALLERY
        </Text>
      </group>

      <mesh position={[0, 0, -8]} rotation={[0, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>
    </group>
  );
}
