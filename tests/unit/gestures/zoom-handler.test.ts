import { describe, test, expect, beforeEach } from 'vitest';
import { ZoomHandler } from '../../../src/ts/core/gestures/handlers/zoom-handler';
import { state } from '../../../src/ts/core/state';
import { initPlatform } from '../../../src/ts/core/platform/platform-context';
import {
  MockInputAdapter,
  MockRenderAdapter,
  MockSchedulerAdapter
} from '../../mocks/platform-mocks';

describe('ZoomHandler', () => {
  let handler: ZoomHandler;
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
    state.gesture.initialPinchDistance = undefined;
    state.debug.zoom = 1.0;
    state.debug.panX = 0;
    state.debug.panY = 0;

    handler = new ZoomHandler();
  });

  describe('onStart', () => {
    test('records initial zoom and distance with two touches', () => {
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

      // Handler should internally record initial distance and zoom
      expect(state.view.zoom).toBe(1.0);
    });

    test('does nothing with only one touch', () => {
      state.gesture.touches.set(1, {
        id: 1,
        startX: 100,
        startY: 100,
        currentX: 100,
        currentY: 100,
        startTime: Date.now()
      });

      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      expect(state.view.zoom).toBe(1.0);
    });
  });

  describe('onMove', () => {
    beforeEach(() => {
      // Set up two touches for zoom gesture
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

    test('zooms in when fingers move apart', () => {
      // Move fingers further apart
      state.gesture.touches.get(1)!.currentX = 50;
      state.gesture.touches.get(1)!.currentY = 50;
      state.gesture.touches.get(2)!.currentX = 250;
      state.gesture.touches.get(2)!.currentY = 250;

      handler.onMove({ pointerId: 1, x: 50, y: 50 });

      // Zoom should increase
      expect(state.view.zoom).toBeGreaterThan(1.0);
    });

    test('zooms out when fingers move together', () => {
      // Move fingers closer together
      state.gesture.touches.get(1)!.currentX = 140;
      state.gesture.touches.get(1)!.currentY = 140;
      state.gesture.touches.get(2)!.currentX = 160;
      state.gesture.touches.get(2)!.currentY = 160;

      handler.onMove({ pointerId: 1, x: 140, y: 140 });

      // Zoom should decrease
      expect(state.view.zoom).toBeLessThan(1.0);
    });

    test('respects minimum zoom limit', () => {
      state.view.zoom = 0.2;
      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      // Try to zoom out further
      state.gesture.touches.get(1)!.currentX = 145;
      state.gesture.touches.get(1)!.currentY = 145;
      state.gesture.touches.get(2)!.currentX = 155;
      state.gesture.touches.get(2)!.currentY = 155;

      handler.onMove({ pointerId: 1, x: 145, y: 145 });

      expect(state.view.zoom).toBeGreaterThanOrEqual(0.1);
    });

    test('respects maximum zoom limit', () => {
      state.view.zoom = 4.5;
      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      // Try to zoom in further
      state.gesture.touches.get(1)!.currentX = 50;
      state.gesture.touches.get(1)!.currentY = 50;
      state.gesture.touches.get(2)!.currentX = 250;
      state.gesture.touches.get(2)!.currentY = 250;

      handler.onMove({ pointerId: 1, x: 50, y: 50 });

      expect(state.view.zoom).toBeLessThanOrEqual(5.0);
    });

    test('updates debug state', () => {
      state.gesture.touches.get(1)!.currentX = 80;
      state.gesture.touches.get(1)!.currentY = 80;
      state.gesture.touches.get(2)!.currentX = 220;
      state.gesture.touches.get(2)!.currentY = 220;

      handler.onMove({ pointerId: 1, x: 80, y: 80 });

      expect(state.debug.zoom).toBe(state.view.zoom);
    });

    test('schedules render', () => {
      state.gesture.touches.get(1)!.currentX = 80;
      state.gesture.touches.get(1)!.currentY = 80;
      state.gesture.touches.get(2)!.currentX = 220;
      state.gesture.touches.get(2)!.currentY = 220;

      handler.onMove({ pointerId: 1, x: 80, y: 80 });

      expect(mockScheduler.scheduledCallbacks.length).toBeGreaterThan(0);
    });

    test('does nothing with only one touch', () => {
      state.gesture.touches.delete(2);

      const initialZoom = state.view.zoom;

      handler.onMove({ pointerId: 1, x: 150, y: 150 });

      expect(state.view.zoom).toBe(initialZoom);
    });
  });

  describe('onEnd', () => {
    test('clears initial pinch distance', () => {
      state.gesture.initialPinchDistance = 100;

      handler.onEnd({ pointerId: 1, x: 100, y: 100 });

      expect(state.gesture.initialPinchDistance).toBeUndefined();
    });
  });

  describe('Zoom with pan adjustment', () => {
    test('adjusts pan to zoom toward touch point', () => {
      // Set up touches at a specific location
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

      // Zoom in
      state.gesture.touches.get(1)!.currentX = 50;
      state.gesture.touches.get(1)!.currentY = 50;
      state.gesture.touches.get(2)!.currentX = 250;
      state.gesture.touches.get(2)!.currentY = 250;

      handler.onMove({ pointerId: 1, x: 50, y: 50 });

      // Pan should be adjusted to keep zoom centered at touch point
      // The exact values depend on the zoom calculation, but pan should change
      expect(state.view.panX !== 0 || state.view.panY !== 0).toBe(true);
    });
  });

  describe('Zoom sensitivity', () => {
    test('small distance change produces small zoom change', () => {
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

      // Small movement
      state.gesture.touches.get(1)!.currentX = 95;
      state.gesture.touches.get(1)!.currentY = 95;
      state.gesture.touches.get(2)!.currentX = 205;
      state.gesture.touches.get(2)!.currentY = 205;

      handler.onMove({ pointerId: 1, x: 95, y: 95 });

      // Zoom should change, but not dramatically
      expect(state.view.zoom).toBeGreaterThan(0.9);
      expect(state.view.zoom).toBeLessThan(1.2);
    });

    test('large distance change produces larger zoom change', () => {
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

      // Large movement
      state.gesture.touches.get(1)!.currentX = 20;
      state.gesture.touches.get(1)!.currentY = 20;
      state.gesture.touches.get(2)!.currentX = 280;
      state.gesture.touches.get(2)!.currentY = 280;

      handler.onMove({ pointerId: 1, x: 20, y: 20 });

      // Zoom should change significantly
      expect(state.view.zoom).toBeGreaterThan(1.2);
    });
  });
});
