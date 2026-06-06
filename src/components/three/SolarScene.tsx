import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { OrbitLine } from './OrbitLine';
import { Stars } from './Stars';
import { planets, BASE_DATE } from '@/data/planets';
import { useSimulationStore } from '@/store/useSimulationStore';
import { getPlanetPosition } from '@/utils/orbitalMath';

function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const { focusedPlanet, setFocusedPlanet } = useSimulationStore();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const { advanceTime } = useSimulationStore.getState();
    advanceTime(delta);

    if (focusedPlanet) {
      const planetData = planets.find((p) => p.name === focusedPlanet);
      if (planetData) {
        const pos = getPlanetPosition(
          planetData,
          useSimulationStore.getState().simulationTime,
          BASE_DATE
        );
        targetLookAt.current.set(pos.x, 0, pos.z);

        const offsetDistance = planetData.scaledRadius * 8;
        targetPosition.current.set(
          pos.x + offsetDistance * 0.5,
          offsetDistance * 0.4,
          pos.z + offsetDistance * 0.7
        );
      }
    } else {
      targetLookAt.current.set(0, 0, 0);
      if (controlsRef.current) {
        const dist = camera.position.length();
        if (dist < 50) {
          targetPosition.current.set(0, 80, 180);
        }
      }
    }

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, Math.min(delta * 3, 1));
      if (focusedPlanet) {
        camera.position.lerp(targetPosition.current, Math.min(delta * 2, 1));
      }
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      dampingFactor={0.08}
      enableDamping
      minDistance={5}
      maxDistance={2500}
      onEnd={() => {
        if (focusedPlanet && controlsRef.current) {
          const currentTarget = controlsRef.current.target.clone();
          const expectedPos = targetLookAt.current.clone();
          if (currentTarget.distanceTo(expectedPos) > 5) {
            setFocusedPlanet(null);
          }
        }
      }}
    />
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <Stars count={5000} radius={1800} />
      <Sun />

      {planets.map((planet) => (
        <OrbitLine key={`orbit-${planet.name}`} planet={planet} />
      ))}

      {planets.map((planet) => (
        <Planet key={planet.name} data={planet} />
      ))}

      <CameraController />

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function SolarScene() {
  return (
    <Canvas
      camera={{ position: [0, 80, 180], fov: 60, near: 0.1, far: 5000 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{ background: '#050510' }}
      onPointerMissed={() => {
        useSimulationStore.getState().setSelectedPlanet(null);
      }}
      dpr={[1, 2]}
    >
      <fog attach="fog" args={['#050510', 400, 2000]} />
      <SceneContent />
    </Canvas>
  );
}
