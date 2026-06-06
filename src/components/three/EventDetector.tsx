import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlanetPosition, MoonPosition } from '@/types';
import { getPlanetPosition, getMoonPosition, checkSolarEclipse, checkPlanetaryAlignment } from '@/utils/orbitalMath';
import { planets, moons, BASE_DATE } from '@/data/planets';
import { useSimulationStore } from '@/store/useSimulationStore';

interface EventDetectorProps {
  simulationTime: number;
}

export function EventDetector({ simulationTime }: EventDetectorProps) {
  const lastEclipseCheck = useRef(0);
  const lastAlignmentCheck = useRef(0);
  const lastEclipseId = useRef<string | null>(null);
  const lastAlignmentId = useRef<string | null>(null);

  const addEvent = useSimulationStore((s) => s.addEvent);
  const setEclipseIntensity = useSimulationStore((s) => s.setEclipseIntensity);

  useFrame(() => {
    const now = simulationTime;

    if (now - lastEclipseCheck.current > 1000 * 60 * 60 * 6) {
      lastEclipseCheck.current = now;

      const earth = planets.find((p) => p.name === 'earth');
      const moon = moons.find((m) => m.name === 'moon');
      if (earth && moon) {
        const earthPos = getPlanetPosition(earth, simulationTime, BASE_DATE);
        const moonPos = getMoonPosition(moon, simulationTime, BASE_DATE, earthPos);
        const isEclipse = checkSolarEclipse(earthPos, moonPos, 3);

        if (isEclipse) {
          const eclipseId = `eclipse-${Math.floor(simulationTime / (1000 * 60 * 60 * 24 * 29))}`;
          if (eclipseId !== lastEclipseId.current) {
            lastEclipseId.current = eclipseId;
            addEvent({
              id: eclipseId,
              type: 'solar_eclipse',
              title: '🌑 日食事件',
              description: '月球正运行到地球与太阳之间，发生日食现象！',
              timestamp: simulationTime,
              severity: 'warning',
            });
          }
          setEclipseIntensity(0.6);
        } else {
          setEclipseIntensity(0);
        }
      }
    }

    if (now - lastAlignmentCheck.current > 1000 * 60 * 60 * 24) {
      lastAlignmentCheck.current = now;

      const planetPositions: Record<string, PlanetPosition> = {};
      for (const planet of planets) {
        planetPositions[planet.name] = getPlanetPosition(planet, simulationTime, BASE_DATE);
      }

      const result = checkPlanetaryAlignment(planetPositions, 3, 30);
      if (result.aligned) {
        const alignmentId = `alignment-${result.planets.join('-')}-${Math.floor(simulationTime / (1000 * 60 * 60 * 24 * 30))}`;
        if (alignmentId !== lastAlignmentId.current) {
          lastAlignmentId.current = alignmentId;
          const planetNames = result.planets
            .map((name) => planets.find((p) => p.name === name)?.nameZh)
            .filter(Boolean)
            .join('、');
          addEvent({
            id: alignmentId,
            type: 'planetary_alignment',
            title: '✨ 行星连珠',
            description: `检测到 ${planetNames} 处于连珠状态！`,
            timestamp: simulationTime,
            severity: 'info',
          });
        }
      }
    }
  });

  return null;
}
