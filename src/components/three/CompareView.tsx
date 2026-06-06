import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SolarScene } from './SolarScene';
import { useSimulationStore } from '@/store/useSimulationStore';
import { formatSimulationDate } from '@/utils/orbitalMath';
import { BASE_DATE } from '@/data/planets';
import { Play, Pause, FastForward, Rewind, Calendar } from 'lucide-react';
import { SIMULATION_SPEEDS } from '@/store/useSimulationStore';

interface CompareViewProps {}

export function CompareView({}: CompareViewProps) {
  const leftControlsRef = useRef<any>(null);
  const rightControlsRef = useRef<any>(null);
  const leftCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rightCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isSyncingRef = useRef(false);

  const {
    isPlaying,
    syncRotation,
    leftSpeedMultiplier,
    rightSpeedMultiplier,
    leftSimulationTime,
    rightSimulationTime,
    setLeftSpeedMultiplier,
    setRightSpeedMultiplier,
    setLeftSimulationTime,
    setRightSimulationTime,
    togglePlay,
    advanceTime,
    setSyncRotation,
  } = useSimulationStore();

  const handleLeftCameraSync = (camera: THREE.PerspectiveCamera, controls: any) => {
    leftCameraRef.current = camera;
    if (syncRotation && rightCameraRef.current && rightControlsRef.current && !isSyncingRef.current) {
      isSyncingRef.current = true;
      rightCameraRef.current.position.copy(camera.position);
      rightControlsRef.current.target.copy(controls.target);
      rightControlsRef.current.update();
      isSyncingRef.current = false;
    }
  };

  const handleRightCameraSync = (camera: THREE.PerspectiveCamera, controls: any) => {
    rightCameraRef.current = camera;
    if (syncRotation && leftCameraRef.current && leftControlsRef.current && !isSyncingRef.current) {
      isSyncingRef.current = true;
      leftCameraRef.current.position.copy(camera.position);
      leftControlsRef.current.target.copy(controls.target);
      leftControlsRef.current.update();
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const delta = 1 / 60;
      advanceTime(delta, 'left');
      advanceTime(delta, 'right');
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying, advanceTime]);

  const minTime = 0;
  const maxTime = 1000 * 365 * 24 * 60 * 60 * 1000 * 200;

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="flex-1 flex gap-1 relative">
        <div className="flex-1 relative">
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <div className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 text-xs font-bold">视口 A</span>
                <span className="text-white/60 text-xs font-mono">
                  {formatSimulationDate(leftSimulationTime, BASE_DATE)}
                </span>
              </div>
            </div>
          </div>
          <SolarScene
            viewSide="left"
            controlsRef={leftControlsRef}
            onCameraSync={handleLeftCameraSync}
          />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="rounded-full bg-black/60 border border-white/20 px-2 py-1 backdrop-blur-sm">
            <span className="text-white/60 text-[10px]">VS</span>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <div className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 text-xs font-bold">视口 B</span>
                <span className="text-white/60 text-xs font-mono">
                  {formatSimulationDate(rightSimulationTime, BASE_DATE)}
                </span>
              </div>
            </div>
          </div>
          <SolarScene
            viewSide="right"
            controlsRef={rightControlsRef}
            onCameraSync={handleRightCameraSync}
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-black/70 p-4 backdrop-blur-xl shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSyncRotation(!syncRotation)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
                    syncRotation
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  {syncRotation ? '🔗' : '🔓'}
                  {syncRotation ? '已同步旋转' : '独立旋转'}
                </button>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
                {SIMULATION_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    onClick={togglePlay}
                    className={`rounded-md px-3 py-1 text-xs font-mono transition-all ${
                      isPlaying ? 'text-amber-400' : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                ))}
              </div>

              <div className="text-xs text-white/40">
                分屏对比模式
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CompareTimeControls
                side="left"
                label="视口 A"
                color="cyan"
                simulationTime={leftSimulationTime}
                speedMultiplier={leftSpeedMultiplier}
                setSimulationTime={setLeftSimulationTime}
                setSpeedMultiplier={setLeftSpeedMultiplier}
                minTime={minTime}
                maxTime={maxTime}
              />
              <CompareTimeControls
                side="right"
                label="视口 B"
                color="amber"
                simulationTime={rightSimulationTime}
                speedMultiplier={rightSpeedMultiplier}
                setSimulationTime={setRightSimulationTime}
                setSpeedMultiplier={setRightSpeedMultiplier}
                minTime={minTime}
                maxTime={maxTime}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompareTimeControlsProps {
  side: 'left' | 'right';
  label: string;
  color: 'cyan' | 'amber';
  simulationTime: number;
  speedMultiplier: number;
  setSimulationTime: (time: number) => void;
  setSpeedMultiplier: (speed: number) => void;
  minTime: number;
  maxTime: number;
}

function CompareTimeControls({
  label,
  color,
  simulationTime,
  speedMultiplier,
  setSimulationTime,
  setSpeedMultiplier,
  minTime,
  maxTime,
}: CompareTimeControlsProps) {
  const currentDate = formatSimulationDate(simulationTime, BASE_DATE);
  const progress = ((simulationTime - minTime) / (maxTime - minTime)) * 100;

  const handleStep = (direction: number) => {
    const step = 1000 * 60 * 60 * 24 * 30 * direction * speedMultiplier;
    setSimulationTime(simulationTime + step);
  };

  const colorClasses = {
    cyan: {
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-300',
      gradient: 'from-cyan-500 to-cyan-300',
      slider: '[&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-cyan-500/50',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      gradient: 'from-amber-500 to-amber-300',
      slider: '[&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-amber-500/50',
    },
  }[color];

  return (
    <div className={`rounded-xl border ${colorClasses.border} ${colorClasses.bg} p-3`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white/70">
          <Calendar size={12} className={colorClasses.text} />
          <span className="text-[11px] font-mono">{currentDate}</span>
        </div>
        <div className="flex items-center gap-0.5 rounded bg-black/30 p-0.5">
          {SIMULATION_SPEEDS.map((speed) => (
            <button
              key={speed}
              onClick={() => setSpeedMultiplier(speed)}
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-all ${
                speedMultiplier === speed
                  ? `${colorClasses.text} bg-white/10 font-bold`
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleStep(-1)}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
        >
          <Rewind size={12} />
        </button>

        <div className="relative flex-1">
          <div className="absolute inset-0 flex items-center">
            <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colorClasses.gradient} rounded-full transition-all`}
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
            onChange={(e) => setSimulationTime(parseFloat(e.target.value))}
            className={`relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-webkit-slider-thumb]:transition-transform
              ${colorClasses.slider}
            `}
          />
        </div>

        <button
          onClick={() => handleStep(1)}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
        >
          <FastForward size={12} />
        </button>
      </div>
    </div>
  );
}
