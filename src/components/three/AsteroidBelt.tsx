import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateAsteroidBelt, SCALE_FACTOR, BASE_DATE } from '@/data/planets';
import { useSimulationStore } from '@/store/useSimulationStore';

interface AsteroidBeltProps {
  simulationTime: number;
  count?: number;
}

export function AsteroidBelt({ simulationTime, count = 500 }: AsteroidBeltProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { showAsteroidBelt } = useSimulationStore();

  const asteroids = useMemo(() => generateAsteroidBelt(count), [count]);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(asteroids.length * 3);
    const colors = new Float32Array(asteroids.length * 3);
    const sizes = new Float32Array(asteroids.length);

    asteroids.forEach((asteroid, i) => {
      positions[i * 3] = asteroid.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = asteroid.z;

      const baseColor = new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 0.2, 0.3 + asteroid.brightness * 0.3);
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;

      sizes[i] = asteroid.size;
    });

    return { positions, colors, sizes };
  }, [asteroids]);

  const innerRadius = 2.2 * SCALE_FACTOR.distance * 10;
  const outerRadius = 3.3 * SCALE_FACTOR.distance * 10;

  useFrame(() => {
    if (!pointsRef.current || !showAsteroidBelt) return;

    const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
    const posAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttribute.array as Float32Array;

    const totalMs = simulationTime - BASE_DATE;
    const totalDays = totalMs / (24 * 60 * 60 * 1000);

    asteroids.forEach((asteroid, i) => {
      const angularSpeed = (2 * Math.PI * asteroid.orbitalSpeed) / (365 * 100);
      const angle = asteroid.baseAngle + totalDays * angularSpeed;
      const radiusFactor = (asteroid.x * asteroid.x + asteroid.z * asteroid.z) / (innerRadius * innerRadius);
      const radius = innerRadius + (outerRadius - innerRadius) * (radiusFactor - 1) / ((outerRadius * outerRadius) / (innerRadius * innerRadius) - 1);
      const actualRadius = Math.sqrt(asteroid.x * asteroid.x + asteroid.z * asteroid.z);

      posArray[i * 3] = actualRadius * Math.cos(angle);
      posArray[i * 3 + 2] = actualRadius * Math.sin(angle);
    });

    posAttribute.needsUpdate = true;
  });

  if (!showAsteroidBelt) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={asteroids.length}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={asteroids.length}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
