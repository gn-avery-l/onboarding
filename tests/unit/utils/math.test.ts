import { describe, test, expect } from 'vitest';
import { distance, generateId } from '../../../src/ts/core/utils/math';

describe('distance', () => {
  test('same point returns 0', () => {
    const p = { x: 5, y: 5 };
    expect(distance(p, p)).toBe(0);
  });

  test('horizontal distance', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 0 };
    expect(distance(p1, p2)).toBe(3);
  });

  test('vertical distance', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 0, y: 4 };
    expect(distance(p1, p2)).toBe(4);
  });

  test('diagonal distance (3-4-5 triangle)', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };
    expect(distance(p1, p2)).toBe(5);
  });

  test('diagonal distance (5-12-13 triangle)', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 5, y: 12 };
    expect(distance(p1, p2)).toBe(13);
  });

  test('works with negative coordinates', () => {
    const p1 = { x: -3, y: -4 };
    const p2 = { x: 0, y: 0 };
    expect(distance(p1, p2)).toBe(5);
  });

  test('works with TouchInfo objects', () => {
    const t1 = {
      id: 1,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 123
    };
    const t2 = {
      id: 2,
      startX: 10,
      startY: 10,
      currentX: 3,
      currentY: 4,
      startTime: 124
    };
    expect(distance(t1, t2)).toBe(5);
  });

  test('distance is commutative', () => {
    const p1 = { x: 10, y: 20 };
    const p2 = { x: 15, y: 25 };
    expect(distance(p1, p2)).toBe(distance(p2, p1));
  });
});

describe('generateId', () => {
  test('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  test('includes timestamp component', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-/);
  });

  test('includes random component', () => {
    const id = generateId();
    const parts = id.split('-');
    expect(parts).toHaveLength(2);
    expect(parts[1]).toMatch(/^[a-z0-9]+$/);
  });

  test('generates multiple unique IDs in sequence', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});
