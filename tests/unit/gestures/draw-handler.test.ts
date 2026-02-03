import { describe, test, expect, beforeEach } from 'vitest';
import { DrawHandler } from '../../../src/ts/core/gestures/handlers/draw-handler';
import { state } from '../../../src/ts/core/state';
import { initPlatform } from '../../../src/ts/core/platform/platform-context';
import {
  MockInputAdapter,
  MockRenderAdapter,
  MockSchedulerAdapter
} from '../../mocks/platform-mocks';

describe('DrawHandler', () => {
  let handler: DrawHandler;
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
    state.strokes = [];
    state.currentStroke = null;
    state.view = { panX: 0, panY: 0, zoom: 1.0, minZoom: 0.1, maxZoom: 5.0 };

    handler = new DrawHandler();
  });

  describe('onStart', () => {
    test('creates a new current stroke', () => {
      handler.onStart({ pointerId: 1, x: 100, y: 150 });

      expect(state.currentStroke).not.toBeNull();
      expect(state.currentStroke?.points).toHaveLength(1);
      expect(state.currentStroke?.points[0]).toEqual({ x: 100, y: 150 });
    });

    test('converts screen coordinates to world coordinates', () => {
      state.view.panX = 50;
      state.view.panY = 30;
      state.view.zoom = 2.0;

      handler.onStart({ pointerId: 1, x: 100, y: 100 });

      // World coords = (screen - pan) / zoom = (100 - 50) / 2 = 25
      expect(state.currentStroke?.points[0]).toEqual({ x: 25, y: 35 });
    });

    test('records start time', () => {
      const beforeTime = Date.now();
      handler.onStart({ pointerId: 1, x: 100, y: 100 });
      const afterTime = Date.now();

      expect(state.currentStroke?.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(state.currentStroke?.startTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('onMove', () => {
    beforeEach(() => {
      handler.onStart({ pointerId: 1, x: 100, y: 100 });
      mockRenderer.resetCalls();
      mockScheduler.resetCallbacks();
    });

    test('adds point to current stroke', () => {
      handler.onMove({ pointerId: 1, x: 150, y: 200 });

      expect(state.currentStroke?.points).toHaveLength(2);
      expect(state.currentStroke?.points[1]).toEqual({ x: 150, y: 200 });
    });

    test('adds multiple points in sequence', () => {
      handler.onMove({ pointerId: 1, x: 120, y: 120 });
      handler.onMove({ pointerId: 1, x: 140, y: 140 });
      handler.onMove({ pointerId: 1, x: 160, y: 160 });

      expect(state.currentStroke?.points).toHaveLength(4);
      expect(state.currentStroke?.points[3]).toEqual({ x: 160, y: 160 });
    });

    test('schedules render', () => {
      handler.onMove({ pointerId: 1, x: 150, y: 200 });

      expect(mockScheduler.scheduledCallbacks.length).toBeGreaterThan(0);
    });

    test('does nothing if no current stroke', () => {
      state.currentStroke = null;

      handler.onMove({ pointerId: 1, x: 150, y: 200 });

      expect(state.currentStroke).toBeNull();
    });
  });

  describe('onEnd', () => {
    beforeEach(() => {
      handler.onStart({ pointerId: 1, x: 100, y: 100 });
      handler.onMove({ pointerId: 1, x: 150, y: 150 });
      handler.onMove({ pointerId: 1, x: 200, y: 200 });
      mockRenderer.resetCalls();
      mockScheduler.resetCallbacks();
    });

    test('finalizes stroke and adds to strokes array', () => {
      handler.onEnd({ pointerId: 1, x: 200, y: 200 });

      expect(state.strokes).toHaveLength(1);
      expect(state.strokes[0].points).toHaveLength(3);
    });

    test('clears current stroke', () => {
      handler.onEnd({ pointerId: 1, x: 200, y: 200 });

      expect(state.currentStroke).toBeNull();
    });

    test('generates unique ID for stroke', () => {
      handler.onEnd({ pointerId: 1, x: 200, y: 200 });

      expect(state.strokes[0].id).toBeDefined();
      expect(typeof state.strokes[0].id).toBe('string');
    });

    test('preserves timestamp', () => {
      const startTime = state.currentStroke!.startTime;
      handler.onEnd({ pointerId: 1, x: 200, y: 200 });

      expect(state.strokes[0].timestamp).toBe(startTime);
    });

    test('schedules render', () => {
      handler.onEnd({ pointerId: 1, x: 200, y: 200 });

      expect(mockScheduler.scheduledCallbacks.length).toBeGreaterThan(0);
    });

    test('does nothing if no current stroke', () => {
      state.currentStroke = null;
      const strokesCount = state.strokes.length;

      handler.onEnd({ pointerId: 1, x: 200, y: 200 });

      expect(state.strokes).toHaveLength(strokesCount);
    });
  });

  describe('Complete drawing workflow', () => {
    test('full stroke lifecycle', () => {
      // Start
      handler.onStart({ pointerId: 1, x: 100, y: 100 });
      expect(state.currentStroke).not.toBeNull();
      expect(state.strokes).toHaveLength(0);

      // Move
      handler.onMove({ pointerId: 1, x: 150, y: 150 });
      handler.onMove({ pointerId: 1, x: 200, y: 200 });
      expect(state.currentStroke?.points).toHaveLength(3);

      // End
      handler.onEnd({ pointerId: 1, x: 200, y: 200 });
      expect(state.currentStroke).toBeNull();
      expect(state.strokes).toHaveLength(1);
      expect(state.strokes[0].points).toHaveLength(3);
    });

    test('multiple strokes', () => {
      // First stroke
      handler.onStart({ pointerId: 1, x: 0, y: 0 });
      handler.onMove({ pointerId: 1, x: 50, y: 50 });
      handler.onEnd({ pointerId: 1, x: 100, y: 100 });

      // Second stroke
      handler.onStart({ pointerId: 1, x: 200, y: 200 });
      handler.onMove({ pointerId: 1, x: 250, y: 250 });
      handler.onEnd({ pointerId: 1, x: 300, y: 300 });

      expect(state.strokes).toHaveLength(2);
      expect(state.strokes[0].id).not.toBe(state.strokes[1].id);
    });
  });
});
