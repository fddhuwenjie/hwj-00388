import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateSunTexture } from '@/utils/textureGenerator';

export function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const sunTexture = useMemo(() => generateSunTexture(), []);

  const sunMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: sunTexture,
        color: 0xffffff,
      }),
    [sunTexture]
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffaa00) },
          viewVector: { value: new THREE.Vector3(0, 0, 1) },
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying float intensity;
          void main() {
            vec3 glow = color * intensity;
            gl_FragColor = vec4(glow, intensity * 0.8);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      }),
    []
  );

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.05;
    }
    if (glowRef.current && glowMaterial.uniforms) {
      const camera = state.camera;
      glowMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
        camera.position,
        glowRef.current.position
      );
    }
  });

  const sunRadius = 8;

  return (
    <group>
      <mesh ref={sunRef} material={sunMaterial}>
        <sphereGeometry args={[sunRadius, 64, 64]} />
      </mesh>

      <mesh ref={glowRef} material={glowMaterial} scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[sunRadius, 32, 32]} />
      </mesh>

      <pointLight
        color={0xffffff}
        intensity={3}
        distance={0}
        decay={0.5}
        castShadow
      />
    </group>
  );
}
