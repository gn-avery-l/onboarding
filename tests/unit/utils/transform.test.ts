import { describe, test, expect } from 'vitest';
import { screenToWorld, worldToScreen } from '../../../src/ts/utils/transform';

describe('screenToWorld', () => {
  test('identity transform at default zoom and pan', () => {
    const result = screenToWorld(100, 200, { panX: 0, panY: 0, zoom: 1.0 });
    expect(result).toEqual({ x: 100, y: 200 });
  });

  test('scales correctly at 2x zoom', () => {
    const result = screenToWorld(100, 200, { panX: 0, panY: 0, zoom: 2.0 });
    expect(result).toEqual({ x: 50, y: 100 });
  });

  test('scales correctly at 0.5x zoom', () => {
    const result = screenToWorld(100, 200, { panX: 0, panY: 0, zoom: 0.5 });
    expect(result).toEqual({ x: 200, y: 400 });
  });

  test('offsets correctly with positive pan', () => {
    const result = screenToWorld(100, 200, { panX: 50, panY: 30, zoom: 1.0 });
    expect(result).toEqual({ x: 50, y: 170 });
  });

  test('offsets correctly with negative pan', () => {
    const result = screenToWorld(100, 200, { panX: -50, panY: -30, zoom: 1.0 });
    expect(result).toEqual({ x: 150, y: 230 });
  });

  test('combines zoom and pan correctly', () => {
    const result = screenToWorld(100, 200, { panX: 40, panY: 60, zoom: 2.0 });
    expect(result).toEqual({ x: 30, y: 70 });
  });

  test('handles zero coordinates', () => {
    const result = screenToWorld(0, 0, { panX: 50, panY: 50, zoom: 2.0 });
    expect(result).toEqual({ x: -25, y: -25 });
  });
});

describe('worldToScreen', () => {
  test('identity transform at default zoom and pan', () => {
    const result = worldToScreen(100, 200, { panX: 0, panY: 0, zoom: 1.0 });
    expect(result).toEqual({ x: 100, y: 200 });
  });

  test('scales correctly at 2x zoom', () => {
    const result = worldToScreen(50, 100, { panX: 0, panY: 0, zoom: 2.0 });
    expect(result).toEqual({ x: 100, y: 200 });
  });

  test('offsets correctly with pan', () => {
    const result = worldToScreen(100, 200, { panX: 50, panY: 30, zoom: 1.0 });
    expect(result).toEqual({ x: 150, y: 230 });
  });

  test('is inverse of screenToWorld', () => {
    const view = { panX: 40, panY: 60, zoom: 2.5 };
    const screen = { x: 123, y: 456 };

    const world = screenToWorld(screen.x, screen.y, view);
    const backToScreen = worldToScreen(world.x, world.y, view);

    expect(backToScreen.x).toBeCloseTo(screen.x, 10);
    expect(backToScreen.y).toBeCloseTo(screen.y, 10);
  });

  test('round-trip conversion maintains precision', () => {
    const view = { panX: -100, panY: 200, zoom: 0.75 };
    const originalWorld = { x: 500, y: 300 };

    const screen = worldToScreen(originalWorld.x, originalWorld.y, view);
    const backToWorld = screenToWorld(screen.x, screen.y, view);

    expect(backToWorld.x).toBeCloseTo(originalWorld.x, 10);
    expect(backToWorld.y).toBeCloseTo(originalWorld.y, 10);
  });
});
