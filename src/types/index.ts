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
  moons?: MoonData[];
}

export interface MoonData {
  name: string;
  nameZh: string;
  parentPlanet: string;
  color: string;
  radius: number;
  scaledRadius: number;
  mass: string;
  diameter: string;
  distanceFromPlanet: number;
  scaledDistanceFromPlanet: number;
  orbitalPeriodDays: number;
  eccentricity: number;
  orbitalSpeed: number;
  rotationPeriod: number;
  inclination: number;
  funFact: string;
}

export interface CometData {
  name: string;
  nameZh: string;
  color: string;
  tailColor: string;
  radius: number;
  scaledRadius: number;
  semiMajorAxis: number;
  scaledSemiMajorAxis: number;
  eccentricity: number;
  orbitalPeriodDays: number;
  inclination: number;
  perihelion: number;
  aphelion: number;
  funFact: string;
}

export interface AsteroidData {
  id: string;
  x: number;
  z: number;
  size: number;
  brightness: number;
  baseAngle: number;
  orbitalSpeed: number;
}

export interface CelestialEvent {
  id: string;
  type: 'solar_eclipse' | 'planetary_alignment';
  title: string;
  description: string;
  timestamp: number;
  severity?: 'info' | 'warning' | 'critical';
}

export interface SimulationState {
  isPlaying: boolean;
  speedMultiplier: number;
  simulationTime: number;
  selectedPlanet: string | null;
  selectedMoon: string | null;
  selectedComet: string | null;
  focusedPlanet: string | null;
  showOrbits: boolean;
  showAsteroidBelt: boolean;
  showMoons: boolean;
  showComets: boolean;
  showEventNotifications: boolean;
  compareMode: boolean;
  syncRotation: boolean;
  leftSpeedMultiplier: number;
  rightSpeedMultiplier: number;
  leftSimulationTime: number;
  rightSimulationTime: number;
  activeEvents: CelestialEvent[];
  dismissedEvents: string[];
  eclipseIntensity: number;
  setIsPlaying: (playing: boolean) => void;
  setSpeedMultiplier: (speed: number) => void;
  setSimulationTime: (time: number) => void;
  setSelectedPlanet: (planet: string | null) => void;
  setSelectedMoon: (moon: string | null) => void;
  setSelectedComet: (comet: string | null) => void;
  setFocusedPlanet: (planet: string | null) => void;
  setShowOrbits: (show: boolean) => void;
  setShowAsteroidBelt: (show: boolean) => void;
  setShowMoons: (show: boolean) => void;
  setShowComets: (show: boolean) => void;
  setShowEventNotifications: (show: boolean) => void;
  setCompareMode: (enabled: boolean) => void;
  setSyncRotation: (sync: boolean) => void;
  setLeftSpeedMultiplier: (speed: number) => void;
  setRightSpeedMultiplier: (speed: number) => void;
  setLeftSimulationTime: (time: number) => void;
  setRightSimulationTime: (time: number) => void;
  setEclipseIntensity: (intensity: number) => void;
  togglePlay: () => void;
  advanceTime: (delta: number, view?: 'left' | 'right' | 'main') => void;
  addEvent: (event: CelestialEvent) => void;
  dismissEvent: (eventId: string) => void;
  clearEvents: () => void;
  selectCelestialBody: (type: 'planet' | 'moon' | 'comet', name: string) => void;
  clearSelection: () => void;
}

export interface PlanetPosition {
  x: number;
  y: number;
  z: number;
  distanceFromSun: number;
  trueAnomaly: number;
  velocity: number;
}

export interface MoonPosition {
  x: number;
  y: number;
  z: number;
  distanceFromPlanet: number;
  trueAnomaly: number;
}

export interface CometPosition {
  x: number;
  y: number;
  z: number;
  distanceFromSun: number;
  trueAnomaly: number;
  velocity: number;
  tailDirection: { x: number; y: number; z: number };
}
