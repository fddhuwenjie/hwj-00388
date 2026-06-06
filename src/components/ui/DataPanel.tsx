import { useMemo } from 'react';
import { Activity, Orbit, Gauge, Ruler, Eye, EyeOff, Moon as MoonIcon, Sparkles as CometIcon, SplitSquareHorizontal, Link, Unlink, Bell, BellOff } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { planets, getPlanetByName, getMoonByName, getCometByName, moons, comets, BASE_DATE } from '@/data/planets';
import { getPlanetPosition, getMoonPosition, getCometPosition } from '@/utils/orbitalMath';

export function DataPanel() {
  const {
    simulationTime,
    selectedPlanet,
    selectedMoon,
    selectedComet,
    speedMultiplier,
    isPlaying,
    showOrbits,
    showAsteroidBelt,
    showMoons,
    showComets,
    showEventNotifications,
    compareMode,
    syncRotation,
    setShowOrbits,
    setShowAsteroidBelt,
    setShowMoons,
    setShowComets,
    setShowEventNotifications,
    setCompareMode,
    setSyncRotation,
    setSelectedPlanet,
    setSelectedMoon,
    setSelectedComet,
  } = useSimulationStore();

  const planetData = selectedPlanet ? getPlanetByName(selectedPlanet) : null;
  const moonData = selectedMoon ? getMoonByName(selectedMoon) : null;
  const cometData = selectedComet ? getCometByName(selectedComet) : null;
  const parentPlanet = moonData ? getPlanetByName(moonData.parentPlanet) : null;

  const liveData = useMemo(() => {
    if (planetData) {
      return {
        type: 'planet' as const,
        pos: getPlanetPosition(planetData, simulationTime, BASE_DATE),
        data: planetData,
      };
    }
    if (moonData && parentPlanet) {
      const planetPos = getPlanetPosition(parentPlanet, simulationTime, BASE_DATE);
      return {
        type: 'moon' as const,
        pos: getMoonPosition(moonData, simulationTime, BASE_DATE, planetPos),
        data: moonData,
      };
    }
    if (cometData) {
      return {
        type: 'comet' as const,
        pos: getCometPosition(cometData, simulationTime, BASE_DATE),
        data: cometData,
      };
    }
    return null;
  }, [planetData, moonData, cometData, parentPlanet, simulationTime]);

  return (
    <div className="absolute top-4 right-4 z-20 w-80">
      <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">
            实时数据面板
          </h2>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <StatusCard label="模拟状态" value={isPlaying ? '运行中' : '已暂停'} accent={isPlaying ? 'emerald' : 'rose'} />
          <StatusCard label="模拟速度" value={`${speedMultiplier}x`} accent="amber" />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            显示选项
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <ToggleButton
              icon={showOrbits ? <Eye size={12} /> : <EyeOff size={12} />}
              label="轨道线"
              active={showOrbits}
              onClick={() => setShowOrbits(!showOrbits)}
            />
            <ToggleButton
              icon={<Activity size={12} />}
              label="小行星带"
              active={showAsteroidBelt}
              onClick={() => setShowAsteroidBelt(!showAsteroidBelt)}
            />
            <ToggleButton
              icon={<MoonIcon size={12} />}
              label="卫星"
              active={showMoons}
              onClick={() => setShowMoons(!showMoons)}
            />
            <ToggleButton
              icon={<CometIcon size={12} />}
              label="彗星"
              active={showComets}
              onClick={() => setShowComets(!showComets)}
            />
            <ToggleButton
              icon={showEventNotifications ? <Bell size={12} /> : <BellOff size={12} />}
              label="事件通知"
              active={showEventNotifications}
              onClick={() => setShowEventNotifications(!showEventNotifications)}
            />
            <ToggleButton
              icon={<SplitSquareHorizontal size={12} />}
              label="对比模式"
              active={compareMode}
              onClick={() => setCompareMode(!compareMode)}
            />
          </div>
          {compareMode && (
            <div className="mt-2">
              <ToggleButton
                icon={syncRotation ? <Link size={12} /> : <Unlink size={12} />}
                label="同步旋转"
                active={syncRotation}
                onClick={() => setSyncRotation(!syncRotation)}
                full
              />
            </div>
          )}
        </div>

        <div className="mb-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {liveData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full shadow-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${liveData.data.color}, ${liveData.data.color}80)`,
                  boxShadow: `0 0 20px ${liveData.data.color}40`,
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{liveData.data.nameZh}</h3>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] ${
                    liveData.type === 'planet' ? 'bg-amber-500/20 text-amber-300' :
                    liveData.type === 'moon' ? 'bg-gray-500/20 text-gray-300' :
                    'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {liveData.type === 'planet' ? '行星' : liveData.type === 'moon' ? '卫星' : '彗星'}
                  </span>
                </div>
                <p className="text-xs text-white/40 font-mono">{liveData.data.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              {liveData.type === 'planet' && (
                <>
                  <DataItem
                    icon={<Orbit size={14} />}
                    label="半长轴 (AU)"
                    value={(liveData.data as any).semiMajorAxis?.toFixed(2) || '-'}
                    color="text-cyan-400"
                  />
                  <DataItem
                    icon={<Ruler size={14} />}
                    label="当前距离 (AU)"
                    value={liveData.pos.distanceFromSun.toFixed(3)}
                    color="text-emerald-400"
                  />
                  <DataItem
                    icon={<Gauge size={14} />}
                    label="当前速度 (km/s)"
                    value={(liveData.pos as any).velocity?.toFixed(2) || '-'}
                    color="text-amber-400"
                  />
                  <DataItem
                    icon={<Activity size={14} />}
                    label="真近点角"
                    value={`${((liveData.pos.trueAnomaly * 180) / Math.PI).toFixed(1)}°`}
                    color="text-violet-400"
                  />
                </>
              )}
              {liveData.type === 'moon' && (
                <>
                  <DataItem
                    icon={<Orbit size={14} />}
                    label="距母星"
                    value={`${(liveData.pos as any).distanceFromPlanet?.toFixed(2) || '-'} (比例)`}
                    color="text-cyan-400"
                  />
                  <DataItem
                    icon={<Activity size={14} />}
                    label="真近点角"
                    value={`${((liveData.pos.trueAnomaly * 180) / Math.PI).toFixed(1)}°`}
                    color="text-violet-400"
                  />
                </>
              )}
              {liveData.type === 'comet' && (
                <>
                  <DataItem
                    icon={<Ruler size={14} />}
                    label="当前距离 (AU)"
                    value={liveData.pos.distanceFromSun.toFixed(3)}
                    color="text-emerald-400"
                  />
                  <DataItem
                    icon={<Activity size={14} />}
                    label="真近点角"
                    value={`${((liveData.pos.trueAnomaly * 180) / Math.PI).toFixed(1)}°`}
                    color="text-violet-400"
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Orbit size={24} className="text-white/30" />
            </div>
            <p className="text-sm text-white/50">点击任意天体</p>
            <p className="text-xs text-white/30 mt-1">查看实时轨道数据</p>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            快速选择 · 行星
          </p>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {planets.map((p) => (
              <BodyButton
                key={p.name}
                name={p.name}
                nameZh={p.nameZh}
                color={p.color}
                selected={selectedPlanet === p.name}
                onClick={() => { setSelectedPlanet(p.name); setSelectedMoon(null); setSelectedComet(null); }}
              />
            ))}
          </div>
          {showMoons && moons.length > 0 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                卫星
              </p>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {moons.map((m) => (
                  <BodyButton
                    key={m.name}
                    name={m.name}
                    nameZh={m.nameZh}
                    color={m.color}
                    selected={selectedMoon === m.name}
                    onClick={() => { setSelectedMoon(m.name); setSelectedPlanet(null); setSelectedComet(null); }}
                  />
                ))}
              </div>
            </>
          )}
          {showComets && comets.length > 0 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                彗星
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {comets.map((c) => (
                  <BodyButton
                    key={c.name}
                    name={c.name}
                    nameZh={c.nameZh}
                    color={c.color}
                    selected={selectedComet === c.name}
                    onClick={() => { setSelectedComet(c.name); setSelectedPlanet(null); setSelectedMoon(null); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  icon,
  label,
  active,
  onClick,
  full,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
        full ? 'col-span-2 justify-center' : ''
      } ${
        active
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function BodyButton({
  name,
  nameZh,
  color,
  selected,
  onClick,
}: {
  name: string;
  nameZh: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-1 rounded-lg py-2 transition-all ${
        selected ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <div
        className="h-5 w-5 rounded-full transition-transform group-hover:scale-125"
        style={{
          background: color,
          boxShadow: selected ? `0 0 12px ${color}80` : 'none',
        }}
      />
      <span
        className={`text-[10px] ${
          selected ? 'text-white' : 'text-white/50 group-hover:text-white/80'
        }`}
      >
        {nameZh}
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
