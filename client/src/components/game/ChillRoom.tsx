import { useRef, useMemo, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/stores/useGame";

function SmokeCloud({ position, color, intensity }: { position: [number, number, number]; color: string; intensity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 0.3 + offset) * 0.5 + (t * 0.1 % 4);
    ref.current.position.x = position[0] + Math.sin(t * 0.2 + offset) * 1;
    ref.current.rotation.z = t * 0.1 + offset;
    const scale = (0.3 + intensity * 0.5) * (1 + Math.sin(t * 0.5 + offset) * 0.3);
    ref.current.scale.setScalar(scale);
    if (ref.current.material instanceof THREE.MeshStandardMaterial) {
      ref.current.material.opacity = Math.max(0, 0.08 + intensity * 0.15 - ((t * 0.1 + offset) % 4) * 0.03);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Bong({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    if (hovered) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onClick={onClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 12]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} emissive={hovered ? "#D4AF37" : "#000"} emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.15, 12]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.15, 0.5, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.04, 0.06, 0.25, 8]} />
        <meshStandardMaterial color="#4a7c3f" />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[0.09, 0.02, 8, 16]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} />
      </mesh>
      {hovered && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#D4AF37"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          TAKE A HIT
        </Text>
      )}
    </group>
  );
}

function Joint({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    if (hovered) {
      ref.current.scale.setScalar(1.1);
    } else {
      ref.current.scale.setScalar(1);
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      rotation={[0, 0, 0.3]}
      onClick={onClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <mesh>
        <cylinderGeometry args={[0.025, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#E8DCC4" emissive={hovered ? "#D4AF37" : "#000"} emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <coneGeometry args={[0.025, 0.05, 8]} />
        <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={0.5} />
      </mesh>
      {hovered && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="#D4AF37"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          PUFF PUFF
        </Text>
      )}
    </group>
  );
}

function Snacks({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.4, 0.08, 0.25]} />
        <meshStandardMaterial color="#FF6347" emissive={hovered ? "#FF6347" : "#000"} emissiveIntensity={hovered ? 0.4 : 0} />
      </mesh>
      <mesh position={[0.2, 0.05, 0.15]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 12]} />
        <meshStandardMaterial color="#FFA500" emissive={hovered ? "#FFA500" : "#000"} emissiveIntensity={hovered ? 0.3 : 0} />
      </mesh>
      <mesh position={[-0.15, 0.12, 0.1]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {hovered && (
        <Text
          position={[0, 0.35, 0]}
          fontSize={0.12}
          color="#D4AF37"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          MUNCHIES TIME!
        </Text>
      )}
    </group>
  );
}

function Couch() {
  return (
    <group position={[0, -0.5, -2]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[3, 0.5, 1]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[0, 0.8, -0.4]}>
        <boxGeometry args={[3, 0.8, 0.2]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[-1.3, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.6, 1]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[1.3, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.6, 1]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[-0.5, 0.6, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color="#9370DB" />
      </mesh>
      <mesh position={[0.5, 0.6, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color="#4a7c3f" />
      </mesh>
    </group>
  );
}

function CoffeeTable() {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.5, 0.05, 0.8]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[-0.6, 0.12, -0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
      <mesh position={[0.6, 0.12, -0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
      <mesh position={[-0.6, 0.12, 0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
      <mesh position={[0.6, 0.12, 0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
    </group>
  );
}

function Lava({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const blobRefs = useRef<THREE.Mesh[]>([]);
  const blobData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      offset: i * 1.2,
      speed: 0.3 + Math.random() * 0.3,
      x: (Math.random() - 0.5) * 0.06,
    })), []);

  useFrame((state) => {
    blobRefs.current.forEach((blob, i) => {
      if (!blob) return;
      const d = blobData[i];
      const t = state.clock.elapsedTime * d.speed + d.offset;
      blob.position.y = -0.3 + (t % 2) * 0.4;
      blob.position.x = d.x + Math.sin(t) * 0.03;
      const scale = 0.03 + Math.sin(t * 2) * 0.01;
      blob.scale.setScalar(scale * 10);
    });
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.12, 0.8, 12]} />
        <meshStandardMaterial color="#9370DB" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 12]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
      <pointLight position={[0, 0, 0.15]} intensity={0.3} color="#9370DB" distance={2} />
      {blobData.map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) blobRefs.current[i] = el; }}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial color="#9370DB" emissive="#9370DB" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Room() {
  const woodTexture = useTexture("/textures/wood.jpg");
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 4);

  return (
    <group>
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
      <mesh position={[0, 4, -5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#2a1a3e" />
      </mesh>
      <mesh position={[-5, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#2a1a3e" />
      </mesh>
      <mesh position={[5, 4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#2a1a3e" />
      </mesh>
    </group>
  );
}

function TripVisuals({ intensity }: { intensity: number }) {
  const ref = useRef<THREE.Group>(null);

  const shapes = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 8,
        Math.random() * 4,
        -2 - Math.random() * 4,
      ] as [number, number, number],
      scale: 0.1 + Math.random() * 0.3,
      speed: 0.5 + Math.random() * 1.5,
      type: Math.floor(Math.random() * 3),
      color: ["#9370DB", "#D4AF37", "#4a7c3f", "#FF6347", "#00BFFF"][Math.floor(Math.random() * 5)],
      offset: Math.random() * Math.PI * 2,
    })), []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.visible = intensity > 0.1;
    ref.current.children.forEach((child, i) => {
      const shape = shapes[i];
      if (!shape) return;
      const t = state.clock.elapsedTime * shape.speed + shape.offset;
      child.rotation.x = t * 0.5;
      child.rotation.y = t * 0.3;
      child.position.y = shape.pos[1] + Math.sin(t) * 0.5;
      const s = shape.scale * intensity * (1 + Math.sin(t * 2) * 0.3);
      child.scale.setScalar(s);
    });
  });

  return (
    <group ref={ref}>
      {shapes.map((shape, i) => (
        <mesh key={i} position={shape.pos}>
          {shape.type === 0 ? (
            <octahedronGeometry args={[1, 0]} />
          ) : shape.type === 1 ? (
            <dodecahedronGeometry args={[1, 0]} />
          ) : (
            <icosahedronGeometry args={[1, 0]} />
          )}
          <meshStandardMaterial
            color={shape.color}
            emissive={shape.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.4}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ChillRoom() {
  const {
    vibeLevel,
    setVibeLevel,
    currentStrain,
    tripIntensity,
    setTripIntensity,
    setPhase,
    addXP,
    incrementSessions,
  } = useGame();

  const smokeParticles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 3,
        Math.random() * 2 - 0.3,
        (Math.random() - 0.5) * 3,
      ] as [number, number, number],
    })), []);

  const handleHit = useCallback(() => {
    const newVibe = Math.min(vibeLevel + 15, 100);
    setVibeLevel(newVibe);
    setTripIntensity(Math.min(tripIntensity + 0.15, 1));
    addXP(10);
    incrementSessions();
    console.log("Hit taken! Vibe:", newVibe, "Trip:", tripIntensity);
  }, [vibeLevel, tripIntensity, setVibeLevel, setTripIntensity, addXP, incrementSessions]);

  const handleMunchies = useCallback(() => {
    setPhase("munchies");
  }, [setPhase]);

  useFrame(() => {
    if (vibeLevel > 0) {
      setVibeLevel(Math.max(0, vibeLevel - 0.02));
    }
    if (tripIntensity > 0) {
      setTripIntensity(Math.max(0, tripIntensity - 0.001));
    }
  });

  const strainColor = currentStrain?.particleColor || "#90EE90";

  return (
    <group>
      <ambientLight intensity={0.2 + tripIntensity * 0.1} color="#E8DCC4" />
      <pointLight position={[0, 3, 0]} intensity={0.6} color="#D4AF37" distance={10} />
      <pointLight position={[-3, 2, -2]} intensity={0.3 + tripIntensity * 0.3} color={currentStrain?.glowColor || "#9370DB"} distance={8} />
      <pointLight position={[3, 1, 1]} intensity={0.2 + tripIntensity * 0.2} color="#D4AF37" distance={6} />
      <spotLight
        position={[0, 4, 2]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.5}
        color="#E8DCC4"
        castShadow
      />

      <Room />
      <Couch />
      <CoffeeTable />
      <Bong position={[-0.3, -0.2, 0.1]} onClick={handleHit} />
      <Joint position={[0.3, -0.22, 0.2]} onClick={handleHit} />
      <Snacks position={[0.5, -0.25, -0.1]} onClick={handleMunchies} />
      <Lava position={[3, 0, -3]} />

      {vibeLevel > 10 && smokeParticles.map((p, i) => (
        <SmokeCloud
          key={i}
          position={p.pos}
          color={strainColor}
          intensity={vibeLevel / 100}
        />
      ))}

      <TripVisuals intensity={tripIntensity} />
    </group>
  );
}
