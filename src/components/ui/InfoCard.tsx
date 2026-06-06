import { X, Globe2 } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { getPlanetByName } from '@/data/planets';

export function InfoCard() {
  const { selectedPlanet, setSelectedPlanet } = useSimulationStore();

  if (!selectedPlanet) return null;

  const planet = getPlanetByName(selectedPlanet);
  if (!planet) return null;

  return (
    <div className="absolute top-24 left-4 z-20 w-80">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        <div
          className="h-28 w-full relative"
          style={{
            background: `linear-gradient(135deg, ${planet.color}40, ${planet.color}10 60%, transparent)`,
          }}
        >
          <div
            className="absolute top-6 right-6 h-16 w-16 rounded-full shadow-2xl"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}80 60%, ${planet.color}40)`,
              boxShadow: `0 0 40px ${planet.color}60`,
            }}
          />
          <button
            onClick={() => setSelectedPlanet(null)}
            className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Globe2 size={18} className="text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              {planet.nameZh}
              <span className="ml-2 text-sm font-normal text-white/50">
                {planet.name.charAt(0).toUpperCase() + planet.name.slice(1)}
              </span>
            </h2>
          </div>

          <div className="mb-4 space-y-2">
            <InfoRow label="质量" value={planet.mass} />
            <InfoRow label="直径" value={planet.diameter} />
            <InfoRow label="距日距离" value={planet.distanceFromSun} />
            <InfoRow label="公转周期" value={planet.orbitalPeriod} />
            <InfoRow label="自转周期" value={`${Math.abs(planet.rotationPeriod)} 地球日${planet.rotationPeriod < 0 ? '（逆向）' : ''}`} />
            <InfoRow label="轨道离心率" value={planet.eccentricity.toFixed(4)} />
            <InfoRow label="轴倾角" value={`${planet.axialTilt.toFixed(2)}°`} />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/80">
              有趣事实
            </h3>
            <p className="text-sm leading-relaxed text-white/75">
              {planet.funFact}
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-white/30">
            双击行星聚焦视角 · 点击空白处关闭
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-1.5">
      <span className="text-xs text-white/50">{label}</span>
      <span className="font-mono text-sm text-white/90">{value}</span>
    </div>
  );
}
