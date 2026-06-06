import { X, Globe2, Moon, Sparkles as CometIcon } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { getPlanetByName, getMoonByName, getCometByName } from '@/data/planets';

export function InfoCard() {
  const { selectedPlanet, selectedMoon, selectedComet, setSelectedPlanet, setSelectedMoon, setSelectedComet } = useSimulationStore();

  const hasSelection = selectedPlanet || selectedMoon || selectedComet;
  if (!hasSelection) return null;

  const planet = selectedPlanet ? getPlanetByName(selectedPlanet) : null;
  const moon = selectedMoon ? getMoonByName(selectedMoon) : null;
  const comet = selectedComet ? getCometByName(selectedComet) : null;

  const data = planet || moon || comet;
  if (!data) return null;

  const type = planet ? 'planet' : moon ? 'moon' : 'comet';

  const handleClose = () => {
    setSelectedPlanet(null);
    setSelectedMoon(null);
    setSelectedComet(null);
  };

  const icon = type === 'planet' ? <Globe2 size={18} className="text-amber-400" /> :
               type === 'moon' ? <Moon size={18} className="text-gray-300" /> :
               <CometIcon size={18} className="text-cyan-400" />;

  const infoRows = (() => {
    if (planet) {
      return [
        { label: '质量', value: planet.mass },
        { label: '直径', value: planet.diameter },
        { label: '距日距离', value: planet.distanceFromSun },
        { label: '公转周期', value: planet.orbitalPeriod },
        { label: '自转周期', value: `${Math.abs(planet.rotationPeriod)} 地球日${planet.rotationPeriod < 0 ? '（逆向）' : ''}` },
        { label: '轨道离心率', value: planet.eccentricity.toFixed(4) },
        { label: '轴倾角', value: `${planet.axialTilt.toFixed(2)}°` },
      ];
    }
    if (moon) {
      return [
        { label: '质量', value: moon.mass },
        { label: '直径', value: moon.diameter },
        { label: '母行星', value: getPlanetByName(moon.parentPlanet)?.nameZh || moon.parentPlanet },
        { label: '距母星', value: `${(moon.distanceFromPlanet / 1000).toFixed(0)} 公里` },
        { label: '公转周期', value: `${moon.orbitalPeriodDays.toFixed(2)} 地球日` },
        { label: '轨道离心率', value: moon.eccentricity.toFixed(4) },
        { label: '轨道倾角', value: `${moon.inclination.toFixed(2)}°` },
      ];
    }
    if (comet) {
      return [
        { label: '彗核直径', value: `${comet.radius * 2} 公里` },
        { label: '近日点', value: `${comet.perihelion.toFixed(3)} AU` },
        { label: '远日点', value: `${comet.aphelion.toFixed(1)} AU` },
        { label: '半长轴', value: `${comet.semiMajorAxis.toFixed(2)} AU` },
        { label: '公转周期', value: `${(comet.orbitalPeriodDays / 365.25).toFixed(2)} 地球年` },
        { label: '轨道离心率', value: comet.eccentricity.toFixed(4) },
        { label: '轨道倾角', value: `${comet.inclination.toFixed(2)}°` },
      ];
    }
    return [];
  })();

  return (
    <div className="absolute top-24 left-4 z-20 w-80">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        <div
          className="h-28 w-full relative"
          style={{
            background: `linear-gradient(135deg, ${data.color}40, ${data.color}10 60%, transparent)`,
          }}
        >
          <div
            className="absolute top-6 right-6 h-16 w-16 rounded-full shadow-2xl"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${data.color}, ${data.color}80 60%, ${data.color}40)`,
              boxShadow: `0 0 40px ${data.color}60`,
            }}
          />
          <button
            onClick={handleClose}
            className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              type === 'planet' ? 'bg-amber-500/20 text-amber-300' :
              type === 'moon' ? 'bg-gray-500/20 text-gray-300' :
              'bg-cyan-500/20 text-cyan-300'
            }`}>
              {type === 'planet' ? '行星' : type === 'moon' ? '卫星' : '彗星'}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-bold text-white tracking-wide">
              {data.nameZh}
              <span className="ml-2 text-sm font-normal text-white/50">
                {data.name.charAt(0).toUpperCase() + data.name.slice(1)}
              </span>
            </h2>
          </div>

          <div className="mb-4 space-y-2">
            {infoRows.map((row, i) => (
              <InfoRow key={i} label={row.label} value={row.value} />
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/80">
              有趣事实
            </h3>
            <p className="text-sm leading-relaxed text-white/75">
              {data.funFact}
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-white/30">
            双击天体聚焦视角 · 点击空白处关闭
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
