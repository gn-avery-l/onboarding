import { type Point, type TouchInfo } from '../types';

export function distance(p1: Point | TouchInfo, p2: Point | TouchInfo): number {
  const x1 = 'currentX' in p1 ? p1.currentX : p1.x;
  const y1 = 'currentY' in p1 ? p1.currentY : p1.y;
  const x2 = 'currentX' in p2 ? p2.currentX : p2.x;
  const y2 = 'currentY' in p2 ? p2.currentY : p2.y;

  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
