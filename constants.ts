import { ShapeType } from './types';

export const PARTICLE_COUNT = 8000;

export const SHAPE_OPTIONS = [
  { id: ShapeType.HEART, label: '❤️ Heart' },
  { id: ShapeType.FLOWER, label: '🌸 Flower' },
  { id: ShapeType.SATURN, label: '🪐 Saturn' },
  { id: ShapeType.BUDDHA, label: '🧘 Buddha' },
  { id: ShapeType.FIREWORK, label: '🎆 Firework' },
];

export const COLOR_PALETTES = [
  '#ff0055', // Pink/Red
  '#00ffff', // Cyan
  '#ffaa00', // Orange/Gold
  '#aa00ff', // Purple
  '#ffffff', // White
  '#00ff66', // Green
];

export const INITIAL_COLOR = '#ff0055';