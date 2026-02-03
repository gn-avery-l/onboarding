import { describe, test, expect, beforeEach } from 'vitest';
import { PanHandler } from '../../../src/ts/core/gestures/handlers/pan-handler';
import { state } from '../../../src/ts/core/state';
import { initPlatform } from '../../../src/ts/core/platform/platform-context';
import {
  MockInputAdapter,
  MockRenderAdapter,
  MockSchedulerAdapter
} from '../../mocks/platform-mocks';

describe('PanHandler', () => {
  let handler: PanHandler;
  let mockRenderer: MockRenderAdapter;
  let mockScheduler: MockSchedulerAdapter;

  beforeEach(() => {
    // Initialize platform with mocks
    mockRenderer = new MockRenderAdapter();
    mockScheduler = new MockSchedulerAdapter();
    initPlatform({
      input: new MockInputAdapter(),
      scheduler: mockScheduler,
      backgroundRenderer: mockRenderer,
      strokeRenderer: mockRenderer
    });

    // Reset state
    state.view = { panX: 0, panY: 0, zoom: 1.0, minZoom: 0.1, maxZoom: 5.0 };
    state.gesture.touches.clear();
    state.debug.panX = 0;
    state.debug.panY = 0;

    handler = new PanHandler();
  });

  describe('onStart', () => {
    test('records initial pan position', () => {
      state.view.panX = 100;
      state.view.panY = 200;

      // Add two touches
      state.gesture.touches.set(1, {
        id: 1,
        startX: 50,
        startY: 50,
        currentX: 50,
        currentY: 50,
        startTime: Date.now()
      });
      state.gesture.touches.set(2, {
        id: 2,
        startX: 150,
        startY: 150,
        currentX: 150,
        currentY: 150,
        startTime: Date.now()
      });

      handler.onStart({ pointerId: 1, x: 50, y: 50 });

      // Handler should record the initial state internally
      // We can't directly test private fields, but we can test the behavior
      expect(state.view.panX).toBe(100);
      expect(state.view.panY).toBe(200);
    });
  });

  describe('onMove', () => {
    beforeEach(() => {
      // Set up two touches for pan gesture
      state.gesture.touches.set(1, {
        id: 1,
        startX: 100,
        startY: 100,
        currentX: 100,
        currentY: 100,
        startTime: Date.now()
      });
      state.gesture.touches.set(2, {
        id: 2,
        startX: 200,
        startY: 200,
        currentX: 200,
        currentY: 200,
        startTime: Date.now()
      });

      handler.onStart({ pointerId: 1, x: 100, y: 100 });
      mockRenderer.resetCalls();
      mockScheduler.resetCallbacks();
    });

    test('pans view when two touches move together', () => {
      // Update touch positions to simulate movement
      state.gesture.touches.get(1)!.currentX = 150;
      state.gesture.touches.get(1)!.currentY = 130;
      state.gesture.touches.get(2)!.currentX = 250;
      state.gesture.touches.get(2)!.currentY = 230;

      handler.onMove({ pointerId: 1, x: 150, y: 130 });

      // Pan should be updated based on centroid movement
      // Initial centroid: (150, 150)
      // New centroid: (200, 180)
      // Delta: (50, 30)
      expect(state.view.panX).toBe(50);
      expect(state.view.panY).toBe(30);
    });

    test('updates debug state', () => {
      state.gesture.touches.get(1)!.currentX = 120;
      state.gesture.touches.get(1)!.currentY = 120;
      state.gesture.touches.get(2)!.currentX = 220;
      state.gesture.touches.get(2)!.currentY = 220;

      handler.onMove({ pointerId: 1, x: 120, y: 120 });

      expect(state.debug.panX).toBe(state.view.panX);
      expect(state.debug.panY).toBe(state.view.panY);
    });

    test('schedules render', () => {
      state.gesture.touches.get(1)!.currentX = 120;
      state.gesture.touches.get(1)!.currentY = 120;
      state.gesture.touches.get(2)!.currentX = 220;
      state.gesture.touches.get(2)!.currentY = 220;

      handler.onMove({ pointerId: 1, x: 120, y: 120 });

      expect(mockScheduler.scheduledCallbacks.length).toBeGreaterThan(0);
    });

    test('does nothing with only one touch', () => {
      // Remove one touch
      state.gesture.touches.delete(2);

      const initialPanX = state.view.panX;
      const initialPanY = state.view.panY;

      handler.onMove({ pointerId: 1, x: 150, y: 150 });

      expect(state.view.panX).toBe(initialPanX);
      expect(state.view.panY).toBe(initialPanY);
    });

    test('pans with initial offset', () => {
      state.view.panX = 100;
      state.view.panY = 50;

      // Re-initialize handler with current pan offset
      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      // Move touches
      state.gesture.touches.get(1)!.currentX = 130;
      state.gesture.touches.get(1)!.currentY = 120;
      state.gesture.touches.get(2)!.currentX = 230;
      state.gesture.touches.get(2)!.currentY = 220;

      handler.onMove({ pointerId: 1, x: 130, y: 120 });

      // Delta: (30, 20) added to initial offset (100, 50)
      expect(state.view.panX).toBe(130);
      expect(state.view.panY).toBe(70);
    });
  });

  describe('onEnd', () => {
    test('does not crash on end', () => {
      expect(() => {
        handler.onEnd({ pointerId: 1, x: 100, y: 100 });
      }).not.toThrow();
    });
  });

  describe('Pan with different touch patterns', () => {
    test('handles horizontal pan', () => {
      state.gesture.touches.set(1, {
        id: 1,
        startX: 100,
        startY: 100,
        currentX: 100,
        currentY: 100,
        startTime: Date.now()
      });
      state.gesture.touches.set(2, {
        id: 2,
        startX: 200,
        startY: 100,
        currentX: 200,
        currentY: 100,
        startTime: Date.now()
      });

      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      // Move horizontally
      state.gesture.touches.get(1)!.currentX = 150;
      state.gesture.touches.get(2)!.currentX = 250;

      handler.onMove({ pointerId: 1, x: 150, y: 100 });

      expect(state.view.panX).toBe(50);
      expect(state.view.panY).toBe(0);
    });

    test('handles vertical pan', () => {
      state.gesture.touches.set(1, {
        id: 1,
        startX: 100,
        startY: 100,
        currentX: 100,
        currentY: 100,
        startTime: Date.now()
      });
      state.gesture.touches.set(2, {
        id: 2,
        startX: 100,
        startY: 200,
        currentX: 100,
        currentY: 200,
        startTime: Date.now()
      });

      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      // Move vertically
      state.gesture.touches.get(1)!.currentY = 150;
      state.gesture.touches.get(2)!.currentY = 250;

      handler.onMove({ pointerId: 1, x: 100, y: 150 });

      expect(state.view.panX).toBe(0);
      expect(state.view.panY).toBe(50);
    });

    test('handles negative pan values', () => {
      state.gesture.touches.set(1, {
        id: 1,
        startX: 200,
        startY: 200,
        currentX: 200,
        currentY: 200,
        startTime: Date.now()
      });
      state.gesture.touches.set(2, {
        id: 2,
        startX: 300,
        startY: 300,
        currentX: 300,
        currentY: 300,
        startTime: Date.now()
      });

      handler.onStart({ pointerId: 1, x: 200, y: 200 });

      // Move backwards
      state.gesture.touches.get(1)!.currentX = 150;
      state.gesture.touches.get(1)!.currentY = 150;
      state.gesture.touches.get(2)!.currentX = 250;
      state.gesture.touches.get(2)!.currentY = 250;

      handler.onMove({ pointerId: 1, x: 150, y: 150 });

      expect(state.view.panX).toBe(-50);
      expect(state.view.panY).toBe(-50);
    });
  });
});
