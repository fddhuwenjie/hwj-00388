import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Calendar,
} from 'lucide-react';
import { useSimulationStore, SIMULATION_SPEEDS } from '@/store/useSimulationStore';
import { formatSimulationDate } from '@/utils/orbitalMath';
import { BASE_DATE } from '@/data/planets';

export function TimeControls() {
  const {
    isPlaying,
    speedMultiplier,
    simulationTime,
    setSimulationTime,
    setSpeedMultiplier,
    togglePlay,
  } = useSimulationStore();

  const minTime = 0;
  const maxTime = 1000 * 365 * 24 * 60 * 60 * 1000 * 200;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimulationTime(parseFloat(e.target.value));
  };

  const handleStep = (direction: number) => {
    const step = 1000 * 60 * 60 * 24 * 30 * direction * speedMultiplier;
    setSimulationTime(simulationTime + step);
  };

  const currentDate = formatSimulationDate(simulationTime, BASE_DATE);
  const progress = ((simulationTime - minTime) / (maxTime - minTime)) * 100;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-2">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar size={16} className="text-amber-400" />
              <span className="font-mono text-sm tracking-wide">{currentDate}</span>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
              {SIMULATION_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSpeedMultiplier(speed)}
                  className={`rounded-md px-3 py-1 text-xs font-mono transition-all ${
                    speedMultiplier === speed
                      ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3 flex items-center gap-3">
            <button
              onClick={() => handleStep(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white"
              title="后退"
            >
              <Rewind size={18} />
            </button>

            <button
              onClick={togglePlay}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-black transition-all hover:bg-amber-400 shadow-lg shadow-amber-500/30 hover:scale-105"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              onClick={() => handleStep(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white"
              title="前进"
            >
              <FastForward size={18} />
            </button>

            <div className="relative ml-2 flex-1">
              <div className="absolute inset-0 flex items-center">
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
              </div>
              <input
                type="range"
                min={minTime}
                max={maxTime}
                step={1000 * 60 * 60 * 24}
                value={simulationTime}
                onChange={handleSliderChange}
                className="relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-amber-400
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-amber-500/50
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:hover:scale-125
                  [&::-webkit-slider-thumb]:transition-transform
                "
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-white/40">
            <span>2024年1月</span>
            <span>200年后</span>
          </div>
        </div>
      </div>
    </div>
  );
}
