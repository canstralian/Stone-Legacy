import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { useGame, type Strain } from "@/lib/stores/useGame";

function StrainCard({ strain, index, total, selected, onSelect }: {
  strain: Strain;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const angle = (index / total) * Math.PI * 2;
  const radius = 3;
  const targetPos = useMemo(() => [
    Math.sin(angle) * radius,
    0,
    Math.cos(angle) * radius - 1,
  ] as [number, number, number], [angle, radius]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.x += (targetPos[0] - ref.current.position.x) * 0.05;
    ref.current.position.z += (targetPos[2] - ref.current.position.z) * 0.05;
    ref.current.lookAt(0, 0, -1);

    if (hovered || selected) {
      ref.current.position.y += (0.3 - ref.current.position.y) * 0.1;
    } else {
      ref.current.position.y += (0 - ref.current.position.y) * 0.1;
    }
  });

  const rarityColor = strain.rarity === "legendary" ? "#D4AF37" : strain.rarity === "rare" ? "#9370DB" : "#A8A8A8";

  return (
    <group
      ref={ref}
      position={targetPos}
      onClick={onSelect}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <mesh>
        <boxGeometry args={[1.4, 1.8, 0.05]} />
        <meshStandardMaterial
          color={strain.unlocked ? "#2a1a3e" : "#1a1a1a"}
          emissive={selected ? strain.color : hovered ? strain.color : "#000"}
          emissiveIntensity={selected ? 0.4 : hovered ? 0.2 : 0}
        />
      </mesh>

      <mesh position={[0, 0.9, 0.03]}>
        <boxGeometry args={[1.4, 0.04, 0.01]} />
        <meshStandardMaterial color={rarityColor} emissive={rarityColor} emissiveIntensity={0.5} />
      </mesh>

      {strain.unlocked ? (
        <>
          <mesh position={[0, 0.25, 0.1]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshStandardMaterial
              color={strain.color}
              emissive={strain.glowColor}
              emissiveIntensity={0.4}
            />
          </mesh>

          <Text
            position={[0, -0.3, 0.04]}
            fontSize={0.12}
            color="#E8DCC4"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
            maxWidth={1.2}
          >
            {strain.name}
          </Text>

          <Text
            position={[0, -0.5, 0.04]}
            fontSize={0.08}
            color={strain.type === "sativa" ? "#7fff00" : strain.type === "indica" ? "#9370DB" : "#D4AF37"}
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            {strain.type.toUpperCase()}
          </Text>

          <Text
            position={[0, -0.7, 0.04]}
            fontSize={0.06}
            color="#A8A8A8"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
            maxWidth={1.1}
          >
            {strain.description}
          </Text>

          <Text
            position={[0, 0.75, 0.04]}
            fontSize={0.07}
            color={rarityColor}
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            {strain.rarity.toUpperCase()}
          </Text>
        </>
      ) : (
        <>
          <Text
            position={[0, 0.1, 0.04]}
            fontSize={0.3}
            color="#4A4A4A"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            ?
          </Text>
          <Text
            position={[0, -0.4, 0.04]}
            fontSize={0.1}
            color="#4A4A4A"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            LOCKED
          </Text>
          <Text
            position={[0, -0.6, 0.04]}
            fontSize={0.07}
            color="#666"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            Level up to unlock
          </Text>
        </>
      )}
    </group>
  );
}

export default function StrainCollection() {
  const { strains, currentStrain, setCurrentStrain, setPhase, stats } = useGame();
  const [selectedIndex, setSelectedIndex] = useState(
    strains.findIndex((s) => s.id === currentStrain?.id) || 0
  );

  return (
    <group>
      <ambientLight intensity={0.3} color="#E8DCC4" />
      <pointLight position={[0, 5, 3]} intensity={0.8} color="#D4AF37" />
      <pointLight position={[-3, 2, 2]} intensity={0.4} color="#9370DB" />
      <pointLight position={[3, 2, 2]} intensity={0.4} color="#4a7c3f" />

      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#0a0515" />
      </mesh>

      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.3}>
        <Text
          position={[0, 3, 0]}
          fontSize={0.6}
          color="#D4AF37"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
          outlineWidth={0.03}
          outlineColor="#4A4A4A"
        >
          STRAIN COLLECTION
        </Text>
      </Float>

      <Text
        position={[0, 2.3, 0]}
        fontSize={0.2}
        color="#A8A8A8"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {`${stats.strainsCollected} / ${strains.length} Discovered`}
      </Text>

      {strains.map((strain, i) => (
        <StrainCard
          key={strain.id}
          strain={strain}
          index={i}
          total={strains.length}
          selected={i === selectedIndex}
          onSelect={() => {
            setSelectedIndex(i);
            if (strain.unlocked) {
              setCurrentStrain(strain);
            }
          }}
        />
      ))}

      <group
        position={[0, -2.5, 2]}
        onClick={() => setPhase("menu")}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <mesh>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshStandardMaterial color="#4A4A4A" emissive="#4A4A4A" emissiveIntensity={0.2} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.2}
          color="#E8DCC4"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          BACK TO MENU
        </Text>
      </group>
    </group>
  );
}
