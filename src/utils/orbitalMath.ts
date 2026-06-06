import * as THREE from 'three';
import { PlanetData, PlanetPosition } from '@/types';

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
  planet: PlanetData,
  timeMs: number,
  baseTimeMs: number
): number {
  const periodDays = planet.orbitalPeriodDays;
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

  const M = meanAnomalyFromTime(planet, timeMs, baseTimeMs);
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

export function createOrbitPoints(
  planet: PlanetData,
  segments: number = 256
): THREE.Vector3[] {
  const a = planet.scaledSemiMajorAxis;
  const e = planet.eccentricity;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    points.push(new THREE.Vector3(x, 0, z));
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
