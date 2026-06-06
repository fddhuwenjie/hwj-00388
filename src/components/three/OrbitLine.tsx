import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '@/types';
import { createPlanetOrbitPoints } from '@/utils/orbitalMath';
import { useSimulationStore } from '@/store/useSimulationStore';

interface OrbitLineProps {
  planet: PlanetData;
}

export function OrbitLine({ planet }: OrbitLineProps) {
  const { showOrbits, selectedPlanet } = useSimulationStore();

  const points = useMemo(() => createPlanetOrbitPoints(planet, 256), [planet]);

  const lineColor = useMemo(() => {
    return new THREE.Color(planet.color);
  }, [planet]);

  if (!showOrbits) return null;

  const isSelected = selectedPlanet === planet.name;

  return (
    <Line
      points={points}
      color={lineColor}
      lineWidth={isSelected ? 2 : 1}
      transparent
      opacity={isSelected ? 0.8 : 0.45}
    />
  );
}
