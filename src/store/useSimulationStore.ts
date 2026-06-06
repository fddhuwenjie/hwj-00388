import { create } from 'zustand';
import { SimulationState } from '@/types';

export const SIMULATION_SPEEDS = [1, 10, 100, 1000];

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isPlaying: true,
  speedMultiplier: 10,
  simulationTime: 0,
  selectedPlanet: null,
  focusedPlanet: null,
  showOrbits: true,

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
  setSimulationTime: (time) => set({ simulationTime: time }),
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  setFocusedPlanet: (planet) => set({ focusedPlanet: planet }),
  setShowOrbits: (show) => set({ showOrbits: show }),

  togglePlay: () => set({ isPlaying: !get().isPlaying }),

  advanceTime: (delta) => {
    const { isPlaying, speedMultiplier, simulationTime } = get();
    if (!isPlaying) return;
    const realTimeMs = delta * 1000;
    const scaledTimeMs = realTimeMs * speedMultiplier * 100000;
    set({ simulationTime: simulationTime + scaledTimeMs });
  },
}));
