import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { planets, BASE_DATE, SCALE_FACTOR } from '@/data/planets';
import { getPlanetPosition, createPlanetOrbitPoints } from '@/utils/orbitalMath';
import { PlanetData } from '@/types';

export function OrbitMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { simulationTime, selectedPlanet, setSelectedPlanet } = useSimulationStore();
  const [size, setSize] = useState({ width: 420, height: 280 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size.width, size.height);

    const cx = size.width / 2;
    const cy = size.height / 2;

    const maxDistance = Math.max(...planets.map((p) => p.scaledSemiMajorAxis * (1 + p.eccentricity)));
    const padding = 30;
    const scale = Math.min(size.width, size.height) / 2 - padding;
    const mapScale = scale / maxDistance;

    const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale + padding);
    bgGradient.addColorStop(0, 'rgba(20, 20, 40, 0.9)');
    bgGradient.addColorStop(1, 'rgba(5, 5, 15, 0.9)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size.width, size.height, 12);
    ctx.fill();

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * size.width;
      const y = Math.random() * size.height;
      const r = Math.random() * 1;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    planets.forEach((planet: PlanetData) => {
      const points = createPlanetOrbitPoints(planet, 128);
      const isSelected = selectedPlanet === planet.name;

      ctx.beginPath();
      ctx.strokeStyle = isSelected ? planet.color : `${planet.color}55`;
      ctx.lineWidth = isSelected ? 1.5 : 0.8;

      points.forEach((p, i) => {
        const px = cx + p.x * mapScale;
        const py = cy + p.z * mapScale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.stroke();
    });

    const sunGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
    sunGradient.addColorStop(0, '#ffeeaa');
    sunGradient.addColorStop(0.5, '#ffcc33');
    sunGradient.addColorStop(1, '#ff880000');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffcc33';
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    planets.forEach((planet: PlanetData) => {
      const pos = getPlanetPosition(planet, simulationTime, BASE_DATE);
      const px = cx + pos.x * mapScale;
      const py = cy + pos.z * mapScale;
      const isSelected = selectedPlanet === planet.name;

      const planetSize = isSelected ? Math.max(5, planet.scaledRadius * 30) : Math.max(3, planet.scaledRadius * 20);

      if (isSelected) {
        ctx.strokeStyle = planet.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, planetSize + 6, 0, Math.PI * 2);
        ctx.stroke();

        const glowGradient = ctx.createRadialGradient(px, py, 0, px, py, planetSize + 8);
        glowGradient.addColorStop(0, `${planet.color}80`);
        glowGradient.addColorStop(1, `${planet.color}00`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(px, py, planetSize + 8, 0, Math.PI * 2);
        ctx.fill();
      }

      const planetGradient = ctx.createRadialGradient(
        px - planetSize * 0.3,
        py - planetSize * 0.3,
        0,
        px,
        py,
        planetSize
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(1, planet.color);
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(px, py, planetSize, 0, Math.PI * 2);
      ctx.fill();

      if (planetSize > 3.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `${isSelected ? 'bold ' : ''}9px -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(planet.nameZh, px + planetSize + 4, py + 3);
      }
    });

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(size.width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, size.height);
    ctx.stroke();

  }, [simulationTime, selectedPlanet, size]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = size.width / 2;
    const cy = size.height / 2;
    const maxDistance = Math.max(...planets.map((p) => p.scaledSemiMajorAxis * (1 + p.eccentricity)));
    const padding = 30;
    const scale = Math.min(size.width, size.height) / 2 - padding;
    const mapScale = scale / maxDistance;

    for (let i = planets.length - 1; i >= 0; i--) {
      const planet = planets[i];
      const pos = getPlanetPosition(planet, simulationTime, BASE_DATE);
      const px = cx + pos.x * mapScale;
      const py = cy + pos.z * mapScale;
      const hitRadius = Math.max(10, planet.scaledRadius * 25);

      if (Math.hypot(x - px, y - py) < hitRadius) {
        setSelectedPlanet(planet.name);
        return;
      }
    }
  };

  return (
    <div className="absolute right-4 bottom-28 z-10">
      <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60">
            轨道俯视图
          </h3>
          <span className="text-[10px] text-white/30">点击行星快速选择</span>
        </div>
        <canvas
          ref={canvasRef}
          style={{ width: size.width, height: size.height, cursor: 'pointer' }}
          className="rounded-xl"
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `rgb(${R}, ${G}, ${B})`;
}
