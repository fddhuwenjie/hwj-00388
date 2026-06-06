import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CometData } from '@/types';
import { getCometPosition } from '@/utils/orbitalMath';
import { BASE_DATE } from '@/data/planets';
import { useSimulationStore } from '@/store/useSimulationStore';

interface CometProps {
  data: CometData;
  simulationTime: number;
}

const TAIL_PARTICLE_COUNT = 200;
const MAX_TAIL_LENGTH = 30;
const TAIL_FADE_DISTANCE = 50;

export function Comet({ data, simulationTime }: CometProps) {
  const nucleusRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const tailPointsRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const { selectedComet, setSelectedComet, showComets } = useSimulationStore();

  const tailGeometry = useMemo(() => {
    const positions = new Float32Array(TAIL_PARTICLE_COUNT * 3);
    const colors = new Float32Array(TAIL_PARTICLE_COUNT * 3);
    const sizes = new Float32Array(TAIL_PARTICLE_COUNT);

    for (let i = 0; i < TAIL_PARTICLE_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const t = i / TAIL_PARTICLE_COUNT;
      const tailColor = new THREE.Color(data.tailColor);
      colors[i * 3] = tailColor.r;
      colors[i * 3 + 1] = tailColor.g;
      colors[i * 3 + 2] = tailColor.b;

      sizes[i] = 0.3 * (1 - t * 0.8);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return geo;
  }, [data]);

  const isSelected = selectedComet === data.name;

  const tailOpacityRef = useRef(0);

  useFrame((state, delta) => {
    if (!showComets) return;

    const cometPos = getCometPosition(data, simulationTime, BASE_DATE);

    if (groupRef.current) {
      groupRef.current.position.x = cometPos.x;
      groupRef.current.position.y = cometPos.y;
      groupRef.current.position.z = cometPos.z;
    }

    if (nucleusRef.current) {
      nucleusRef.current.rotation.y += delta * 0.5;
    }

    const distanceFromSun = cometPos.distanceFromSun;
    const tailStartDistance = 5;
    const tailMaxDistance = 2;

    let targetOpacity = 0;
    if (distanceFromSun < tailStartDistance) {
      targetOpacity = Math.max(0, 1 - (distanceFromSun - tailMaxDistance) / (tailStartDistance - tailMaxDistance));
    }
    tailOpacityRef.current += (targetOpacity - tailOpacityRef.current) * Math.min(delta * 3, 1);

    if (tailPointsRef.current && tailOpacityRef.current > 0.01) {
      const geo = tailPointsRef.current.geometry as THREE.BufferGeometry;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      const colorAttr = geo.attributes.color as THREE.BufferAttribute;
      const colorArray = colorAttr.array as Float32Array;

      const tailLength = MAX_TAIL_LENGTH * tailOpacityRef.current;
      const tailDir = cometPos.tailDirection;

      for (let i = 0; i < TAIL_PARTICLE_COUNT; i++) {
        const t = i / TAIL_PARTICLE_COUNT;
        const distance = t * tailLength;
        const spread = t * 1.5;

        const offsetX = (Math.sin(i * 123.456 + state.clock.elapsedTime * 0.5) * spread);
        const offsetY = (Math.cos(i * 789.012 + state.clock.elapsedTime * 0.3) * spread);
        const offsetZ = (Math.sin(i * 456.789 + state.clock.elapsedTime * 0.7) * spread);

        posArray[i * 3] = tailDir.x * distance + offsetX;
        posArray[i * 3 + 1] = tailDir.y * distance + offsetY;
        posArray[i * 3 + 2] = tailDir.z * distance + offsetZ;

        const alpha = (1 - t) * tailOpacityRef.current;
        const tailColor = new THREE.Color(data.tailColor);
        colorArray[i * 3] = tailColor.r;
        colorArray[i * 3 + 1] = tailColor.g;
        colorArray[i * 3 + 2] = tailColor.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      (tailPointsRef.current.material as THREE.PointsMaterial).opacity = tailOpacityRef.current * 0.7;
    }

    if (glowRef.current) {
      const glowIntensity = tailOpacityRef.current * 0.8;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedComet(data.name);
  };

  if (!showComets) return null;

  return (
    <group ref={groupRef}>
      <mesh
        ref={nucleusRef}
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
          color={data.color}
          roughness={0.95}
          metalness={0.1}
          emissive={isSelected ? new THREE.Color(data.color).multiplyScalar(0.3) : new THREE.Color(data.color).multiplyScalar(0.05)}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[data.scaledRadius * 3, 32, 32]} />
        <meshBasicMaterial
          color={data.tailColor}
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points ref={tailPointsRef} geometry={tailGeometry}>
        <pointsMaterial
          size={0.25}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {isSelected && (
        <mesh>
          <ringGeometry args={[data.scaledRadius * 2, data.scaledRadius * 2.3, 32]} />
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
