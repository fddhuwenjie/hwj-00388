import { create } from 'zustand';
import { SimulationState, CelestialEvent } from '@/types';

export const SIMULATION_SPEEDS = [1, 10, 100, 1000, 10000];

const INITIAL_LEFT_TIME = 0;
const INITIAL_RIGHT_TIME = 1000 * 365 * 24 * 60 * 60 * 1000 * 10;

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isPlaying: true,
  speedMultiplier: 10,
  simulationTime: 0,
  selectedPlanet: null,
  selectedMoon: null,
  selectedComet: null,
  focusedPlanet: null,
  showOrbits: true,
  showAsteroidBelt: true,
  showMoons: true,
  showComets: true,
  showEventNotifications: true,
  compareMode: false,
  syncRotation: true,
  leftSpeedMultiplier: 10,
  rightSpeedMultiplier: 10,
  leftSimulationTime: INITIAL_LEFT_TIME,
  rightSimulationTime: INITIAL_RIGHT_TIME,
  activeEvents: [],
  dismissedEvents: [],
  eclipseIntensity: 0,

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
  setSimulationTime: (time) => set({ simulationTime: time }),
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet, selectedMoon: null, selectedComet: null }),
  setSelectedMoon: (moon) => set({ selectedMoon: moon, selectedPlanet: null, selectedComet: null }),
  setSelectedComet: (comet) => set({ selectedComet: comet, selectedPlanet: null, selectedMoon: null }),
  setFocusedPlanet: (planet) => set({ focusedPlanet: planet }),
  setShowOrbits: (show) => set({ showOrbits: show }),
  setShowAsteroidBelt: (show) => set({ showAsteroidBelt: show }),
  setShowMoons: (show) => set({ showMoons: show }),
  setShowComets: (show) => set({ showComets: show }),
  setShowEventNotifications: (show) => set({ showEventNotifications: show }),
  setCompareMode: (enabled) => set({ compareMode: enabled }),
  setSyncRotation: (sync) => set({ syncRotation: sync }),
  setLeftSpeedMultiplier: (speed) => set({ leftSpeedMultiplier: speed }),
  setRightSpeedMultiplier: (speed) => set({ rightSpeedMultiplier: speed }),
  setLeftSimulationTime: (time) => set({ leftSimulationTime: time }),
  setRightSimulationTime: (time) => set({ rightSimulationTime: time }),
  setEclipseIntensity: (intensity) => set({ eclipseIntensity: intensity }),

  togglePlay: () => set({ isPlaying: !get().isPlaying }),

  advanceTime: (delta, view = 'main') => {
    const state = get();
    if (!state.isPlaying) return;
    const realTimeMs = delta * 1000;

    if (view === 'left') {
      const scaledTimeMs = realTimeMs * state.leftSpeedMultiplier * 100000;
      set({ leftSimulationTime: state.leftSimulationTime + scaledTimeMs });
    } else if (view === 'right') {
      const scaledTimeMs = realTimeMs * state.rightSpeedMultiplier * 100000;
      set({ rightSimulationTime: state.rightSimulationTime + scaledTimeMs });
    } else {
      const scaledTimeMs = realTimeMs * state.speedMultiplier * 100000;
      set({ simulationTime: state.simulationTime + scaledTimeMs });
    }
  },

  addEvent: (event: CelestialEvent) => {
    const { activeEvents, dismissedEvents } = get();
    if (dismissedEvents.includes(event.id)) return;
    if (activeEvents.find((e) => e.id === event.id)) return;
    set({ activeEvents: [...activeEvents, event] });
  },

  dismissEvent: (eventId: string) => {
    const { activeEvents, dismissedEvents } = get();
    set({
      activeEvents: activeEvents.filter((e) => e.id !== eventId),
      dismissedEvents: [...dismissedEvents, eventId],
    });
  },

  clearEvents: () => set({ activeEvents: [], dismissedEvents: [] }),

  selectCelestialBody: (type, name) => {
    if (type === 'planet') {
      set({ selectedPlanet: name, selectedMoon: null, selectedComet: null });
    } else if (type === 'moon') {
      set({ selectedMoon: name, selectedPlanet: null, selectedComet: null });
    } else {
      set({ selectedComet: name, selectedPlanet: null, selectedMoon: null });
    }
  },

  clearSelection: () => {
    set({ selectedPlanet: null, selectedMoon: null, selectedComet: null });
  },
}));
