import { useMemo } from 'react';
import { Activity, Orbit, Gauge, Ruler, Eye, EyeOff } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { planets, getPlanetByName, BASE_DATE } from '@/data/planets';
import { getPlanetPosition } from '@/utils/orbitalMath';

export function DataPanel() {
  const {
    simulationTime,
    selectedPlanet,
    speedMultiplier,
    isPlaying,
    showOrbits,
    setShowOrbits,
  } = useSimulationStore();

  const planetData = selectedPlanet ? getPlanetByName(selectedPlanet) : null;

  const liveData = useMemo(() => {
    if (!planetData) return null;
    return getPlanetPosition(planetData, simulationTime, BASE_DATE);
  }, [planetData, simulationTime]);

  return (
    <div className="absolute top-4 right-4 z-20 w-80">
      <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">
            实时数据面板
          </h2>
          <button
            onClick={() => setShowOrbits(!showOrbits)}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            {showOrbits ? <Eye size={12} /> : <EyeOff size={12} />}
            轨道线
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <StatusCard label="模拟状态" value={isPlaying ? '运行中' : '已暂停'} accent={isPlaying ? 'emerald' : 'rose'} />
          <StatusCard label="模拟速度" value={`${speedMultiplier}x`} accent="amber" />
        </div>

        <div className="mb-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {planetData && liveData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full shadow-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${planetData.color}, ${planetData.color}80)`,
                  boxShadow: `0 0 20px ${planetData.color}40`,
                }}
              />
              <div>
                <h3 className="text-base font-bold text-white">{planetData.nameZh}</h3>
                <p className="text-xs text-white/40 font-mono">{planetData.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <DataItem
                icon={<Orbit size={14} />}
                label="半长轴 (AU)"
                value={planetData.semiMajorAxis.toFixed(2)}
                color="text-cyan-400"
              />
              <DataItem
                icon={<Ruler size={14} />}
                label="当前距离 (AU)"
                value={liveData.distanceFromSun.toFixed(3)}
                color="text-emerald-400"
              />
              <DataItem
                icon={<Gauge size={14} />}
                label="当前速度 (km/s)"
                value={liveData.velocity.toFixed(2)}
                color="text-amber-400"
              />
              <DataItem
                icon={<Activity size={14} />}
                label="轨道离心率"
                value={planetData.eccentricity.toFixed(4)}
                color="text-rose-400"
              />
              <DataItem
                icon={<Activity size={14} />}
                label="真近点角"
                value={`${((liveData.trueAnomaly * 180) / Math.PI).toFixed(1)}°`}
                color="text-violet-400"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Orbit size={24} className="text-white/30" />
            </div>
            <p className="text-sm text-white/50">点击任意行星</p>
            <p className="text-xs text-white/30 mt-1">查看实时轨道数据</p>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            快速选择
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {planets.map((p) => (
              <PlanetButton key={p.name} planet={p} selected={selectedPlanet === p.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanetButton({
  planet,
  selected,
}: {
  planet: { name: string; nameZh: string; color: string };
  selected: boolean;
}) {
  const setSelectedPlanet = useSimulationStore((s) => s.setSelectedPlanet);

  return (
    <button
      onClick={() => setSelectedPlanet(planet.name)}
      className={`group flex flex-col items-center gap-1 rounded-lg py-2 transition-all ${
        selected ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <div
        className="h-5 w-5 rounded-full transition-transform group-hover:scale-125"
        style={{
          background: planet.color,
          boxShadow: selected ? `0 0 12px ${planet.color}80` : 'none',
        }}
      />
      <span
        className={`text-[10px] ${
          selected ? 'text-white' : 'text-white/50 group-hover:text-white/80'
        }`}
      >
        {planet.nameZh}
      </span>
    </button>
  );
}

function StatusCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'emerald' | 'rose' | 'amber';
}) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return (
    <div className={`rounded-xl border px-3 py-2 ${colors[accent]}`}>
      <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="font-mono text-sm font-bold">{value}</p>
    </div>
  );
}

function DataItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className={`${color}`}>{icon}</span>
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}
