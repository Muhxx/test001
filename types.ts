export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha',
  FIREWORK = 'Firework',
  SPHERE = 'Sphere'
}

export interface ParticleConfig {
  count: number;
  color: string;
  shape: ShapeType;
  size: number;
}

export interface HandData {
  factor: number; // 0.0 (closed/small) to 1.0 (open/large)
  isPresent: boolean;
}

export interface AppState {
  shape: ShapeType;
  color: string;
  isHandTracking: boolean;
  debugMode: boolean;
}