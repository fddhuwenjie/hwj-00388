import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlanetData } from '@/types';
import { generatePlanetTexture, generateRingTexture } from '@/utils/textureGenerator';
import { getPlanetPosition } from '@/utils/orbitalMath';
import { BASE_DATE } from '@/data/planets';
import { useSimulationStore } from '@/store/useSimulationStore';

interface PlanetProps {
  data: PlanetData;
}

export function Planet({ data }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const { simulationTime, selectedPlanet, setSelectedPlanet, focusedPlanet } =
    useSimulationStore();

  const texture = useMemo(() => {
    const options: Record<string, any> = { seed: data.name.length * 1234 };
    if (data.name === 'mercury' || data.name === 'mars') {
      options.craters = true;
      options.noiseIntensity = 0.4;
    }
    if (data.name === 'earth') {
      options.clouds = true;
      options.noiseIntensity = 0.25;
    }
    if (data.name === 'jupiter' || data.name === 'saturn') {
      options.bandCount = 12;
      options.noiseIntensity = 0.35;
    }
    if (data.name === 'uranus' || data.name === 'neptune') {
      options.bandCount = 6;
      options.noiseIntensity = 0.2;
    }
    if (data.name === 'venus') {
      options.clouds = true;
      options.noiseIntensity = 0.15;
    }
    return generatePlanetTexture(data.color, options);
  }, [data]);

  const ringTexture = useMemo(() => {
    if (data.hasRings) return generateRingTexture();
    return null;
  }, [data]);

  const atmosphereMaterial = useMemo(() => {
    if (!data.atmosphereColor) return null;
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(data.atmosphereColor) },
        viewVector: { value: new THREE.Vector3(0, 0, 1) },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.65 - dot(vNormal, vNormel), 3.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float intensity;
        void main() {
          vec3 glow = color * intensity;
          gl_FragColor = vec4(glow, intensity * 0.6);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }, [data]);

  const isSelected = selectedPlanet === data.name;
  const isFocused = focusedPlanet === data.name;

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = (data.axialTilt * Math.PI) / 180;
    }
  }, [data]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const rotSpeed = (Math.PI * 2) / (Math.abs(data.rotationPeriod) * 200);
      const direction = data.rotationPeriod < 0 ? -1 : 1;
      meshRef.current.rotation.y += delta * rotSpeed * direction;
    }

    if (groupRef.current) {
      const pos = getPlanetPosition(data, simulationTime, BASE_DATE);
      groupRef.current.position.x = pos.x;
      groupRef.current.position.z = pos.z;
    }

    if (atmosphereRef.current && atmosphereMaterial?.uniforms) {
      atmosphereMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
        camera.position,
        atmosphereRef.current.getWorldPosition(new THREE.Vector3())
      );
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedPlanet(data.name);
  };

  const handleDoubleClick = (e: any) => {
    e.stopPropagation();
    useSimulationStore.getState().setFocusedPlanet(data.name);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[data.scaledRadius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0.05}
          emissive={isSelected ? new THREE.Color(data.color).multiplyScalar(0.15) : new THREE.Color(0x000000)}
        />
      </mesh>

      {data.hasRings && ringTexture && (
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[data.ringInnerRadius!, data.ringOuterRadius!, 128]} />
          <meshBasicMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      )}

      {atmosphereMaterial && (
        <mesh ref={atmosphereRef} material={atmosphereMaterial} scale={[1.15, 1.15, 1.15]}>
          <sphereGeometry args={[data.scaledRadius, 32, 32]} />
        </mesh>
      )}

      {(isSelected || isFocused) && (
        <mesh>
          <ringGeometry args={[data.scaledRadius * 1.5, data.scaledRadius * 1.65, 64]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
