import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/stores/useGame";

interface FoodItem {
  id: number;
  type: string;
  color: string;
  position: [number, number, number];
  speed: number;
  collected: boolean;
  points: number;
}

const FOOD_TYPES = [
  { type: "pizza", color: "#FF6347", points: 10 },
  { type: "burger", color: "#8B4513", points: 15 },
  { type: "donut", color: "#FFB6C1", points: 20 },
  { type: "taco", color: "#DAA520", points: 12 },
  { type: "cookie", color: "#D2691E", points: 8 },
  { type: "fries", color: "#FFD700", points: 10 },
  { type: "icecream", color: "#FFC0CB", points: 25 },
  { type: "brownie", color: "#4A2C2A", points: 30 },
];

function FallingFood({ item, onCollect }: { item: FoodItem; onCollect: (id: number) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!ref.current || item.collected) return;
    ref.current.position.y -= item.speed * 0.016;
    ref.current.rotation.z += 0.02;
    ref.current.rotation.x += 0.01;

    if (ref.current.position.y < -5) {
      ref.current.position.y = 6;
      ref.current.position.x = (Math.random() - 0.5) * 8;
    }
  });

  if (item.collected) return null;

  return (
    <mesh
      ref={ref}
      position={item.position}
      onClick={() => onCollect(item.id)}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      scale={hovered ? 1.3 : 1}
    >
      {item.type === "pizza" ? (
        <coneGeometry args={[0.3, 0.08, 3]} />
      ) : item.type === "burger" ? (
        <cylinderGeometry args={[0.25, 0.25, 0.2, 8]} />
      ) : item.type === "donut" ? (
        <torusGeometry args={[0.2, 0.08, 8, 16]} />
      ) : item.type === "brownie" ? (
        <boxGeometry args={[0.35, 0.15, 0.35]} />
      ) : item.type === "icecream" ? (
        <coneGeometry args={[0.15, 0.4, 8]} />
      ) : (
        <sphereGeometry args={[0.2, 8, 8]} />
      )}
      <meshStandardMaterial
        color={item.color}
        emissive={hovered ? item.color : "#000"}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
}

function PlayerMouth() {
  const ref = useRef<THREE.Group>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = mousePos.current.x * 5;
  });

  return (
    <group ref={ref} position={[0, -3.5, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.3, 0.3]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.3} />
      </mesh>
      <Text
        position={[0, 0.3, 0.2]}
        fontSize={0.15}
        color="#E8DCC4"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        NOM NOM
      </Text>
    </group>
  );
}

export default function MunchieGame() {
  const { munchieScore, setMunchieScore, addMunchiesEaten, addXP, setPhase } = useGame();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [combo, setCombo] = useState(0);
  const lastCollectTime = useRef(0);

  useEffect(() => {
    const initialFoods: FoodItem[] = Array.from({ length: 15 }, (_, i) => {
      const foodType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
      return {
        id: i,
        type: foodType.type,
        color: foodType.color,
        position: [
          (Math.random() - 0.5) * 8,
          3 + Math.random() * 5,
          0,
        ] as [number, number, number],
        speed: 1 + Math.random() * 2,
        collected: false,
        points: foodType.points,
      };
    });
    setFoods(initialFoods);
  }, []);

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  const collectFood = useCallback((id: number) => {
    if (!gameActive) return;
    const now = Date.now();
    const timeSinceLastCollect = now - lastCollectTime.current;
    lastCollectTime.current = now;

    let newCombo = combo;
    if (timeSinceLastCollect < 1500) {
      newCombo = Math.min(combo + 1, 10);
    } else {
      newCombo = 0;
    }
    setCombo(newCombo);

    setFoods((prev) => {
      const food = prev.find((f) => f.id === id);
      if (!food || food.collected) return prev;

      const points = food.points * (1 + newCombo * 0.5);
      setMunchieScore(munchieScore + Math.floor(points));
      addMunchiesEaten(1);

      return prev.map((f) =>
        f.id === id ? { ...f, collected: true } : f
      );
    });

    setTimeout(() => {
      setFoods((prev) => {
        const newFoodType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
        const newFood: FoodItem = {
          id: Date.now(),
          type: newFoodType.type,
          color: newFoodType.color,
          position: [
            (Math.random() - 0.5) * 8,
            5 + Math.random() * 3,
            0,
          ],
          speed: 1 + Math.random() * 2.5,
          collected: false,
          points: newFoodType.points,
        };
        return [...prev.filter((f) => !f.collected), newFood];
      });
    }, 300);
  }, [gameActive, combo, munchieScore, setMunchieScore, addMunchiesEaten]);

  return (
    <group>
      <ambientLight intensity={0.4} color="#E8DCC4" />
      <pointLight position={[0, 5, 5]} intensity={1} color="#D4AF37" />
      <pointLight position={[-4, 3, 2]} intensity={0.5} color="#9370DB" />
      <pointLight position={[4, 3, 2]} intensity={0.5} color="#4a7c3f" />

      <mesh position={[0, 0, -3]}>
        <planeGeometry args={[15, 12]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      {foods.map((food) => (
        <FallingFood key={food.id} item={food} onCollect={collectFood} />
      ))}

      <PlayerMouth />

      <Text
        position={[0, 4.5, 0]}
        fontSize={0.6}
        color="#D4AF37"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
        outlineWidth={0.03}
        outlineColor="#4A4A4A"
      >
        {`SCORE: ${munchieScore}`}
      </Text>

      <Text
        position={[-3.5, 4.5, 0]}
        fontSize={0.4}
        color={timeLeft <= 10 ? "#FF6347" : "#E8DCC4"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {`TIME: ${timeLeft}s`}
      </Text>

      {combo > 1 && (
        <Text
          position={[3.5, 4.5, 0]}
          fontSize={0.35}
          color="#9370DB"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          {`COMBO x${combo}`}
        </Text>
      )}

      {!gameActive && (
        <group>
          <mesh position={[0, 1, 1]}>
            <boxGeometry args={[6, 3, 0.1]} />
            <meshStandardMaterial color="#1a0a2e" transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 2, 1.1]}
            fontSize={0.5}
            color="#D4AF37"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            MUNCHIES OVER!
          </Text>
          <Text
            position={[0, 1.2, 1.1]}
            fontSize={0.35}
            color="#E8DCC4"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            {`Final Score: ${munchieScore}`}
          </Text>
          <group
            position={[0, 0.2, 1.1]}
            onClick={() => {
              addXP(Math.floor(munchieScore / 2));
              setPhase("playing");
            }}
            onPointerOver={() => { document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { document.body.style.cursor = "default"; }}
          >
            <mesh>
              <boxGeometry args={[2.5, 0.6, 0.1]} />
              <meshStandardMaterial color="#4a7c3f" emissive="#4a7c3f" emissiveIntensity={0.3} />
            </mesh>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.25}
              color="#E8DCC4"
              anchorX="center"
              anchorY="middle"
              font="/fonts/inter.json"
            >
              BACK TO SESH
            </Text>
          </group>
        </group>
      )}
    </group>
  );
}
