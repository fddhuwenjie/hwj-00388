import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { OrbitLine } from './OrbitLine';
import { Stars } from './Stars';
import { Comet } from './Comet';
import { AsteroidBelt } from './AsteroidBelt';
import { EventDetector } from './EventDetector';
import { planets, comets, BASE_DATE } from '@/data/planets';
import { useSimulationStore } from '@/store/useSimulationStore';
import { getPlanetPosition, createCometOrbitPoints, createPlanetOrbitPoints } from '@/utils/orbitalMath';

interface CameraControllerProps {
  simulationTime: number;
  controlsRef?: React.RefObject<any>;
  onCameraSync?: (camera: THREE.PerspectiveCamera, controls: any) => void;
}

function CameraController({ simulationTime, controlsRef, onCameraSync }: CameraControllerProps) {
  const { camera } = useThree();
  const localControlsRef = useRef<any>(null);
  const actualControlsRef = controlsRef || localControlsRef;
  const { focusedPlanet, setFocusedPlanet, advanceTime, syncRotation, compareMode } = useSimulationStore();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (!compareMode) {
      advanceTime(delta);
    }

    if (focusedPlanet) {
      const planetData = planets.find((p) => p.name === focusedPlanet);
      if (planetData) {
        const pos = getPlanetPosition(
          planetData,
          simulationTime,
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
    }

    if (actualControlsRef.current) {
      actualControlsRef.current.target.lerp(targetLookAt.current, Math.min(delta * 3, 1));
      if (focusedPlanet) {
        camera.position.lerp(targetPosition.current, Math.min(delta * 2, 1));
      }
      actualControlsRef.current.update();
    }

    if (onCameraSync && actualControlsRef.current) {
      onCameraSync(camera as THREE.PerspectiveCamera, actualControlsRef.current);
    }
  });

  return (
    <OrbitControls
      ref={actualControlsRef}
      makeDefault={!controlsRef}
      enablePan
      enableZoom
      enableRotate
      dampingFactor={0.08}
      enableDamping
      minDistance={5}
      maxDistance={2500}
      onEnd={() => {
        if (focusedPlanet && actualControlsRef.current) {
          const currentTarget = actualControlsRef.current.target.clone();
          const expectedPos = targetLookAt.current.clone();
          if (currentTarget.distanceTo(expectedPos) > 5) {
            setFocusedPlanet(null);
          }
        }
      }}
    />
  );
}

interface SceneContentProps {
  simulationTime: number;
  controlsRef?: React.RefObject<any>;
  onCameraSync?: (camera: THREE.PerspectiveCamera, controls: any) => void;
}

function SceneContent({ simulationTime, controlsRef, onCameraSync }: SceneContentProps) {
  const { showOrbits, showAsteroidBelt, showComets, showMoons } = useSimulationStore();

  return (
    <>
      <ambientLight intensity={0.08} />
      <Stars count={5000} radius={1800} />
      <Sun />

      {showOrbits && planets.map((planet) => (
        <OrbitLine key={`orbit-${planet.name}`} planet={planet} />
      ))}

      {showOrbits && showComets && comets.map((comet) => {
        const points = createCometOrbitPoints(comet);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`comet-orbit-${comet.name}`}>
            <bufferGeometry attach="geometry" {...lineGeometry} />
            <lineBasicMaterial
              attach="material"
              color={comet.tailColor}
              transparent
              opacity={0.25}
            />
          </line>
        );
      })}

      {planets.map((planet) => (
        <Planet key={planet.name} data={planet} simulationTime={simulationTime} />
      ))}

      {showComets && comets.map((comet) => (
        <Comet key={comet.name} data={comet} simulationTime={simulationTime} />
      ))}

      {showAsteroidBelt && <AsteroidBelt simulationTime={simulationTime} count={500} />}

      <EventDetector simulationTime={simulationTime} />

      <CameraController
        simulationTime={simulationTime}
        controlsRef={controlsRef}
        onCameraSync={onCameraSync}
      />

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

interface SolarSceneProps {
  timeOverride?: number;
  viewSide?: 'left' | 'right' | 'main';
  controlsRef?: React.RefObject<any>;
  onCameraSync?: (camera: THREE.PerspectiveCamera, controls: any) => void;
}

export function SolarScene({ timeOverride, viewSide = 'main', controlsRef, onCameraSync }: SolarSceneProps) {
  const storeSimulationTime = useSimulationStore((s) => s.simulationTime);
  const leftSimulationTime = useSimulationStore((s) => s.leftSimulationTime);
  const rightSimulationTime = useSimulationStore((s) => s.rightSimulationTime);
  const clearSelection = useSimulationStore((s) => s.clearSelection);

  const simulationTime = timeOverride !== undefined
    ? timeOverride
    : viewSide === 'left'
      ? leftSimulationTime
      : viewSide === 'right'
        ? rightSimulationTime
        : storeSimulationTime;

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
        clearSelection();
      }}
      dpr={[1, 2]}
    >
      <fog attach="fog" args={['#050510', 400, 2000]} />
      <SceneContent
        simulationTime={simulationTime}
        controlsRef={controlsRef}
        onCameraSync={onCameraSync}
      />
    </Canvas>
  );
}
