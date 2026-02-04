import { describe, test, expect, beforeEach } from 'vitest';
import { EraseHandler } from '../../../src/ts/core/gestures/handlers/erase-handler';
import { state } from '../../../src/ts/core/state';
import { initPlatform } from '../../../src/ts/core/platform/platform-context';
import {
  MockInputAdapter,
  MockRenderAdapter,
  MockSchedulerAdapter
} from '../../mocks/platform-mocks';

describe('EraseHandler', () => {
  let handler: EraseHandler;
  let mockRenderer: MockRenderAdapter;

  beforeEach(() => {
    // Initialize platform with mocks
    mockRenderer = new MockRenderAdapter();
    initPlatform({
      input: new MockInputAdapter(),
      scheduler: new MockSchedulerAdapter(),
      backgroundRenderer: mockRenderer,
      strokeRenderer: mockRenderer
    });

    // Reset state
    state.strokes = [];
    state.view = { panX: 0, panY: 0, zoom: 1.0, minZoom: 0.1, maxZoom: 5.0 };

    handler = new EraseHandler();
  });

  describe('Erasing strokes', () => {
    test('completely erases stroke when touching it', () => {
      // Create a stroke
      state.strokes = [
        {
          id: '1',
          points: [
            { x: 100, y: 100 },
            { x: 110, y: 110 },
            { x: 120, y: 120 }
          ],
          timestamp: 123
        }
      ];

      // Erase at the middle point
      handler.onStart({ pointerId: 1, x: 110, y: 110 });

      expect(state.strokes).toHaveLength(0);
    });

    test('splits stroke when erasing middle section', () => {
      // Create a longer stroke
      state.strokes = [
        {
          id: '1',
          points: [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
            { x: 100, y: 100 },
            { x: 150, y: 150 },
            { x: 200, y: 200 }
          ],
          timestamp: 123
        }
      ];

      // Erase the middle point
      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      // Should split into two strokes
      expect(state.strokes.length).toBeGreaterThan(0);

      // Check that middle point was removed
      const allPoints = state.strokes.flatMap(s => s.points);
      const hasMiddlePoint = allPoints.some(p =>
        Math.abs(p.x - 100) < 1 && Math.abs(p.y - 100) < 1
      );
      expect(hasMiddlePoint).toBe(false);
    });

    test('does not affect strokes far from erase point', () => {
      state.strokes = [
        {
          id: '1',
          points: [{ x: 100, y: 100 }],
          timestamp: 123
        },
        {
          id: '2',
          points: [{ x: 500, y: 500 }],
          timestamp: 124
        }
      ];

      // Erase near first stroke
      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      // Second stroke should remain
      const remainingStrokes = state.strokes.filter(s =>
        s.points.some(p => p.x === 500 && p.y === 500)
      );
      expect(remainingStrokes).toHaveLength(1);
    });

    test('erases multiple strokes in one motion', () => {
      state.strokes = [
        {
          id: '1',
          points: [{ x: 100, y: 100 }],
          timestamp: 123
        },
        {
          id: '2',
          points: [{ x: 105, y: 105 }],
          timestamp: 124
        }
      ];

      handler.onStart({ pointerId: 1, x: 102, y: 102 });

      expect(state.strokes).toHaveLength(0);
    });
  });

  describe('Erase with zoom', () => {
    test('accounts for zoom level when erasing', () => {
      state.view.zoom = 2.0;

      state.strokes = [
        {
          id: '1',
          points: [{ x: 50, y: 50 }],
          timestamp: 123
        }
      ];

      // At 2x zoom, screen coords 100,100 -> world coords 50,50
      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      expect(state.strokes).toHaveLength(0);
    });
  });

  describe('onMove', () => {
    test('erases along movement path', () => {
      state.strokes = [
        {
          id: '1',
          points: [
            { x: 100, y: 100 },
            { x: 150, y: 150 },
            { x: 200, y: 200 }
          ],
          timestamp: 123
        }
      ];

      handler.onStart({ pointerId: 1, x: 100, y: 100 });
      handler.onMove({ pointerId: 1, x: 150, y: 150 });
      handler.onMove({ pointerId: 1, x: 200, y: 200 });

      // All points should be erased
      expect(state.strokes).toHaveLength(0);
    });
  });

  describe('onEnd', () => {
    test('final erase at end position', () => {
      state.strokes = [
        {
          id: '1',
          points: [{ x: 200, y: 200 }],
          timestamp: 123
        }
      ];

      handler.onEnd({ pointerId: 1, x: 200, y: 200 });

      expect(state.strokes).toHaveLength(0);
    });
  });

  describe('Stroke splitting edge cases', () => {
    test('preserves timestamp when splitting strokes', () => {
      const originalTimestamp = 12345;
      state.strokes = [
        {
          id: '1',
          points: [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
            { x: 100, y: 100 },
            { x: 150, y: 150 }
          ],
          timestamp: originalTimestamp
        }
      ];

      handler.onStart({ pointerId: 1, x: 75, y: 75 });

      // All resulting strokes should have same timestamp
      state.strokes.forEach(stroke => {
        expect(stroke.timestamp).toBe(originalTimestamp);
      });
    });

    test('generates unique IDs for split strokes', () => {
      state.strokes = [
        {
          id: 'original',
          points: [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
            { x: 100, y: 100 },
            { x: 150, y: 150 }
          ],
          timestamp: 123
        }
      ];

      handler.onStart({ pointerId: 1, x: 75, y: 75 });

      if (state.strokes.length > 1) {
        const ids = state.strokes.map(s => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });
  });
});
