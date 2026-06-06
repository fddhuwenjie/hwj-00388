import { SolarScene } from '@/components/three/SolarScene';
import { CompareView } from '@/components/three/CompareView';
import { TimeControls } from '@/components/ui/TimeControls';
import { InfoCard } from '@/components/ui/InfoCard';
import { DataPanel } from '@/components/ui/DataPanel';
import { OrbitMap } from '@/components/ui/OrbitMap';
import { EventNotifications } from '@/components/ui/EventNotifications';
import { Sparkles } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';

export default function App() {
  const compareMode = useSimulationStore((s) => s.compareMode);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050510]">
      {compareMode ? (
        <CompareView />
      ) : (
        <>
          <SolarScene />

          <div className="pointer-events-none absolute top-4 left-4 z-20">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-xl">
              <div className="relative">
                <Sparkles size={20} className="text-amber-400" />
                <div className="absolute inset-0 animate-ping opacity-30">
                  <Sparkles size={20} className="text-amber-400" />
                </div>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">
                  太阳系模拟器
                </h1>
                <p className="text-[10px] text-white/40 font-mono">
                  Solar System Simulator
                </p>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto">
            <DataPanel />
            <InfoCard />
            <OrbitMap />
            <TimeControls />
            <EventNotifications />
          </div>

          <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 pointer-events-none">
            <div className="rounded-full border border-white/10 bg-black/40 px-4 py-1.5 backdrop-blur-lg">
              <p className="text-[11px] text-white/50">
                拖拽旋转视角 · 滚轮缩放 · 点击行星/卫星/彗星查看详情 · 双击聚焦
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
