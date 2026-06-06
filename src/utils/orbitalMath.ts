import * as THREE from 'three';
import { PlanetData, PlanetPosition, MoonData, MoonPosition, CometData, CometPosition } from '@/types';

const G = 6.6743e-11;
const SUN_MASS = 1.989e30;

export function solveKeplerEquation(M: number, e: number, tolerance: number = 1e-8): number {
  let E = M;
  for (let i = 0; i < 100; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tolerance) break;
  }
  return E;
}

export function meanAnomalyFromTime(
  orbitalPeriodDays: number,
  timeMs: number,
  baseTimeMs: number
): number {
  const periodDays = orbitalPeriodDays;
  const periodMs = periodDays * 24 * 60 * 60 * 1000;
  const t = (timeMs - baseTimeMs) % periodMs;
  const M = (2 * Math.PI * t) / periodMs;
  return M;
}

export function getPlanetPosition(
  planet: PlanetData,
  timeMs: number,
  baseTimeMs: number
): PlanetPosition {
  const a = planet.scaledSemiMajorAxis;
  const e = planet.eccentricity;

  const M = meanAnomalyFromTime(planet.orbitalPeriodDays, timeMs, baseTimeMs);
  const E = solveKeplerEquation(M, e);

  const trueAnomaly =
    2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));

  const r = a * (1 - e * Math.cos(E));

  const x = r * Math.cos(trueAnomaly);
  const z = r * Math.sin(trueAnomaly);

  const periodDays = planet.orbitalPeriodDays;
  const periodSeconds = periodDays * 24 * 60 * 60;
  const meanAngularVelocity = (2 * Math.PI) / periodSeconds;

  const velocityFactor = Math.sqrt((1 + e * Math.cos(trueAnomaly)) / (1 - e * e));
  const velocity = planet.orbitalSpeed * velocityFactor;

  return {
    x,
    y: 0,
    z,
    distanceFromSun: r / 60,
    trueAnomaly,
    velocity,
  };
}

export function getMoonPosition(
  moon: MoonData,
  timeMs: number,
  baseTimeMs: number,
  planetPosition: PlanetPosition
): MoonPosition {
  const a = moon.scaledDistanceFromPlanet;
  const e = moon.eccentricity;
  const inclinationRad = (moon.inclination * Math.PI) / 180;

  const M = meanAnomalyFromTime(moon.orbitalPeriodDays, timeMs, baseTimeMs);
  const E = solveKeplerEquation(M, e);

  const trueAnomaly =
    2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));

  const r = a * (1 - e * Math.cos(E));

  const localX = r * Math.cos(trueAnomaly);
  const localZ = r * Math.sin(trueAnomaly);
  const localY = localZ * Math.sin(inclinationRad);
  const adjustedLocalZ = localZ * Math.cos(inclinationRad);

  return {
    x: planetPosition.x + localX,
    y: localY,
    z: planetPosition.z + adjustedLocalZ,
    distanceFromPlanet: r,
    trueAnomaly,
  };
}

export function getCometPosition(
  comet: CometData,
  timeMs: number,
  baseTimeMs: number
): CometPosition {
  const a = comet.scaledSemiMajorAxis;
  const e = comet.eccentricity;
  const inclinationRad = (comet.inclination * Math.PI) / 180;

  const M = meanAnomalyFromTime(comet.orbitalPeriodDays, timeMs, baseTimeMs);
  const E = solveKeplerEquation(M, e);

  const trueAnomaly =
    2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));

  const r = a * (1 - e * Math.cos(E));

  const localX = r * Math.cos(trueAnomaly);
  const localZ = r * Math.sin(trueAnomaly);
  const y = localZ * Math.sin(inclinationRad);
  const z = localZ * Math.cos(inclinationRad);

  const tailDirection = {
    x: -localX / r,
    y: -y / r,
    z: -z / r,
  };

  const velocity = Math.sqrt((G * SUN_MASS) / (r * 1.496e11)) / 1000;

  return {
    x: localX,
    y,
    z,
    distanceFromSun: r / 60,
    trueAnomaly,
    velocity,
    tailDirection,
  };
}

export function createOrbitPoints(
  semiMajorAxis: number,
  eccentricity: number,
  inclination: number = 0,
  segments: number = 256
): THREE.Vector3[] {
  const a = semiMajorAxis;
  const e = eccentricity;
  const inclinationRad = (inclination * Math.PI) / 180;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = z * Math.sin(inclinationRad);
    const adjustedZ = z * Math.cos(inclinationRad);
    points.push(new THREE.Vector3(x, y, adjustedZ));
  }

  return points;
}

export function createPlanetOrbitPoints(
  planet: PlanetData,
  segments: number = 256
): THREE.Vector3[] {
  return createOrbitPoints(planet.scaledSemiMajorAxis, planet.eccentricity, 0, segments);
}

export function createCometOrbitPoints(
  comet: CometData,
  segments: number = 512
): THREE.Vector3[] {
  return createOrbitPoints(comet.scaledSemiMajorAxis, comet.eccentricity, comet.inclination, segments);
}

export function createMoonOrbitPoints(
  moon: MoonData,
  segments: number = 128
): THREE.Vector3[] {
  const a = moon.scaledDistanceFromPlanet;
  const e = moon.eccentricity;
  const inclinationRad = (moon.inclination * Math.PI) / 180;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = z * Math.sin(inclinationRad);
    const adjustedZ = z * Math.cos(inclinationRad);
    points.push(new THREE.Vector3(x, y, adjustedZ));
  }

  return points;
}

export function formatSimulationDate(timeMs: number, baseTimeMs: number): string {
  const date = new Date(baseTimeMs + timeMs);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function checkSolarEclipse(
  earthPos: PlanetPosition,
  moonPos: MoonPosition,
  toleranceDegrees: number = 2
): boolean {
  const sunToEarth = new THREE.Vector3(earthPos.x, earthPos.y, earthPos.z);
  const sunToMoon = new THREE.Vector3(moonPos.x, moonPos.y, moonPos.z);
  const angle = sunToEarth.angleTo(sunToMoon);
  const toleranceRad = (toleranceDegrees * Math.PI) / 180;

  const moonToEarthDist = Math.sqrt(
    Math.pow(moonPos.x - earthPos.x, 2) +
    Math.pow(moonPos.y - earthPos.y, 2) +
    Math.pow(moonPos.z - earthPos.z, 2)
  );
  const earthToSunDist = Math.sqrt(
    Math.pow(earthPos.x, 2) + Math.pow(earthPos.y, 2) + Math.pow(earthPos.z, 2)
  );

  return angle < toleranceRad && moonToEarthDist < earthToSunDist * 0.1;
}

export function checkPlanetaryAlignment(
  planetPositions: Record<string, PlanetPosition>,
  minPlanets: number = 3,
  toleranceDegrees: number = 15
): { aligned: boolean; planets: string[]; centerAngle: number } {
  const angles: { name: string; angle: number }[] = [];

  for (const [name, pos] of Object.entries(planetPositions)) {
    const angle = Math.atan2(pos.z, pos.x);
    angles.push({ name, angle });
  }

  const sortedAngles = [...angles].sort((a, b) => a.angle - b.angle);
  const toleranceRad = (toleranceDegrees * Math.PI) / 180;

  for (let i = 0; i < sortedAngles.length; i++) {
    const cluster: typeof sortedAngles = [];
    const baseAngle = sortedAngles[i].angle;

    for (let j = 0; j < sortedAngles.length; j++) {
      const idx = (i + j) % sortedAngles.length;
      let angleDiff = sortedAngles[idx].angle - baseAngle;
      if (angleDiff < 0) angleDiff += 2 * Math.PI;
      if (angleDiff <= toleranceRad) {
        cluster.push(sortedAngles[idx]);
      } else {
        break;
      }
    }

    if (cluster.length >= minPlanets) {
      const centerAngle =
        cluster.reduce((sum, a) => sum + a.angle, 0) / cluster.length;
      return {
        aligned: true,
        planets: cluster.map((p) => p.name),
        centerAngle,
      };
    }
  }

  return { aligned: false, planets: [], centerAngle: 0 };
}
