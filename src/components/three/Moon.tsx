import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MoonData, PlanetPosition } from '@/types';
import { generatePlanetTexture } from '@/utils/textureGenerator';
import { getMoonPosition } from '@/utils/orbitalMath';
import { BASE_DATE } from '@/data/planets';
import { useSimulationStore } from '@/store/useSimulationStore';

interface MoonProps {
  data: MoonData;
  planetPosition: PlanetPosition;
  simulationTime: number;
}

export function Moon({ data, planetPosition, simulationTime }: MoonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { selectedMoon, setSelectedMoon } = useSimulationStore();

  const texture = useMemo(() => {
    return generatePlanetTexture(data.color, {
      seed: data.name.length * 5678,
      craters: true,
      noiseIntensity: 0.5,
    });
  }, [data]);

  const isSelected = selectedMoon === data.name;

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = 0;
    }
  }, [data]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const rotSpeed = (Math.PI * 2) / (Math.abs(data.rotationPeriod) * 200);
      const direction = data.rotationPeriod < 0 ? -1 : 1;
      meshRef.current.rotation.y += delta * rotSpeed * direction;
    }

    if (groupRef.current) {
      const pos = getMoonPosition(data, simulationTime, BASE_DATE, planetPosition);
      groupRef.current.position.x = pos.x;
      groupRef.current.position.y = pos.y;
      groupRef.current.position.z = pos.z;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedMoon(data.name);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[data.scaledRadius, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.9}
          metalness={0.05}
          emissive={isSelected ? new THREE.Color(data.color).multiplyScalar(0.2) : new THREE.Color(0x000000)}
        />
      </mesh>

      {isSelected && (
        <mesh>
          <ringGeometry args={[data.scaledRadius * 1.5, data.scaledRadius * 1.7, 32]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
