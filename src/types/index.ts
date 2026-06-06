export interface PlanetData {
  name: string;
  nameZh: string;
  color: string;
  radius: number;
  scaledRadius: number;
  mass: string;
  diameter: string;
  distanceFromSun: string;
  orbitalPeriod: string;
  orbitalPeriodDays: number;
  semiMajorAxis: number;
  scaledSemiMajorAxis: number;
  eccentricity: number;
  orbitalSpeed: number;
  rotationPeriod: number;
  axialTilt: number;
  funFact: string;
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  atmosphereColor?: string;
}

export interface SimulationState {
  isPlaying: boolean;
  speedMultiplier: number;
  simulationTime: number;
  selectedPlanet: string | null;
  focusedPlanet: string | null;
  showOrbits: boolean;
  setIsPlaying: (playing: boolean) => void;
  setSpeedMultiplier: (speed: number) => void;
  setSimulationTime: (time: number) => void;
  setSelectedPlanet: (planet: string | null) => void;
  setFocusedPlanet: (planet: string | null) => void;
  setShowOrbits: (show: boolean) => void;
  togglePlay: () => void;
  advanceTime: (delta: number) => void;
}

export interface PlanetPosition {
  x: number;
  y: number;
  z: number;
  distanceFromSun: number;
  trueAnomaly: number;
  velocity: number;
}
