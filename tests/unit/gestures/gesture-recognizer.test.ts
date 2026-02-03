import { describe, test, expect, beforeEach } from 'vitest';
import { GestureRecognizer } from '../../../src/ts/core/gestures/gesture-recognizer';
import { state } from '../../../src/ts/core/state';
import { GestureType } from '../../../src/ts/core/types';
import { initPlatform } from '../../../src/ts/core/platform/platform-context';
import {
  MockInputAdapter,
  MockRenderAdapter,
  MockSchedulerAdapter
} from '../../mocks/platform-mocks';

describe('GestureRecognizer', () => {
  let recognizer: GestureRecognizer;
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
    state.gesture.touches.clear();
    state.gesture.currentGesture = GestureType.NONE;
    state.gesture.isEraseKeyPressed = false;
    state.gesture.initialPinchDistance = undefined;
    state.strokes = [];
    state.currentStroke = null;

    recognizer = new GestureRecognizer();
  });

  describe('Single touch gestures', () => {
    test('single touch starts DRAW gesture', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });

      expect(state.gesture.currentGesture).toBe(GestureType.DRAW);
      expect(state.gesture.touches.size).toBe(1);
    });

    test('single touch with E key pressed starts ERASE gesture', () => {
      recognizer.handleKeyDown({ key: 'e' });
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });

      expect(state.gesture.currentGesture).toBe(GestureType.ERASE);
      expect(state.gesture.isEraseKeyPressed).toBe(true);
    });

    test('pressing E while drawing switches to ERASE', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      expect(state.gesture.currentGesture).toBe(GestureType.DRAW);

      recognizer.handleKeyDown({ key: 'e' });
      expect(state.gesture.currentGesture).toBe(GestureType.ERASE);
      expect(state.gesture.isEraseKeyPressed).toBe(true);
    });

    test('releasing E while erasing switches to DRAW', () => {
      recognizer.handleKeyDown({ key: 'e' });
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      expect(state.gesture.currentGesture).toBe(GestureType.ERASE);

      recognizer.handleKeyUp({ key: 'e' });
      expect(state.gesture.currentGesture).toBe(GestureType.DRAW);
      expect(state.gesture.isEraseKeyPressed).toBe(false);
    });
  });

  describe('Two touch gestures', () => {
    test('two touches start PAN gesture', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      recognizer.handlePointerDown({ pointerId: 2, x: 200, y: 200 });

      expect(state.gesture.currentGesture).toBe(GestureType.PAN);
      expect(state.gesture.touches.size).toBe(2);
    });

    test('two touches with significant pinch motion switch to ZOOM', () => {
      // Start with two touches close together
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      recognizer.handlePointerDown({ pointerId: 2, x: 120, y: 120 });
      expect(state.gesture.currentGesture).toBe(GestureType.PAN);

      // Move fingers apart significantly (> 50px change)
      recognizer.handlePointerMove({ pointerId: 1, x: 50, y: 50 });
      recognizer.handlePointerMove({ pointerId: 2, x: 200, y: 200 });

      expect(state.gesture.currentGesture).toBe(GestureType.ZOOM);
    });
  });

  describe('Touch tracking', () => {
    test('tracks pointer down correctly', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 150 });

      const touch = state.gesture.touches.get(1);
      expect(touch).toBeDefined();
      expect(touch?.startX).toBe(100);
      expect(touch?.startY).toBe(150);
      expect(touch?.currentX).toBe(100);
      expect(touch?.currentY).toBe(150);
    });

    test('updates touch position on move', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      recognizer.handlePointerMove({ pointerId: 1, x: 150, y: 200 });

      const touch = state.gesture.touches.get(1);
      expect(touch?.startX).toBe(100);
      expect(touch?.startY).toBe(100);
      expect(touch?.currentX).toBe(150);
      expect(touch?.currentY).toBe(200);
    });

    test('removes touch on pointer up', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      expect(state.gesture.touches.size).toBe(1);

      recognizer.handlePointerUp({ pointerId: 1, x: 100, y: 100 });
      expect(state.gesture.touches.size).toBe(0);
    });

    test('tracks multiple touches independently', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      recognizer.handlePointerDown({ pointerId: 2, x: 200, y: 200 });

      expect(state.gesture.touches.size).toBe(2);
      expect(state.gesture.touches.get(1)?.startX).toBe(100);
      expect(state.gesture.touches.get(2)?.startX).toBe(200);
    });
  });

  describe('Gesture transitions', () => {
    test('transitions from DRAW to PAN when adding second touch', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      expect(state.gesture.currentGesture).toBe(GestureType.DRAW);

      recognizer.handlePointerDown({ pointerId: 2, x: 200, y: 200 });
      expect(state.gesture.currentGesture).toBe(GestureType.PAN);
    });

    test('transitions from PAN to DRAW when removing one touch', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      recognizer.handlePointerDown({ pointerId: 2, x: 200, y: 200 });
      expect(state.gesture.currentGesture).toBe(GestureType.PAN);

      recognizer.handlePointerUp({ pointerId: 2, x: 200, y: 200 });
      expect(state.gesture.currentGesture).toBe(GestureType.DRAW);
    });

    test('transitions to NONE when all touches released', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      recognizer.handlePointerUp({ pointerId: 1, x: 100, y: 100 });

      expect(state.gesture.currentGesture).toBe(GestureType.NONE);
      expect(state.gesture.touches.size).toBe(0);
    });
  });

  describe('Debug state updates', () => {
    test('updates debug touch count', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      expect(state.debug.touchCount).toBe(1);

      recognizer.handlePointerDown({ pointerId: 2, x: 200, y: 200 });
      expect(state.debug.touchCount).toBe(2);

      recognizer.handlePointerUp({ pointerId: 1, x: 100, y: 100 });
      expect(state.debug.touchCount).toBe(1);
    });

    test('updates debug gesture type', () => {
      recognizer.handlePointerDown({ pointerId: 1, x: 100, y: 100 });
      expect(state.debug.gestureType).toBe(GestureType.DRAW);

      recognizer.handleKeyDown({ key: 'e' });
      expect(state.debug.gestureType).toBe(GestureType.ERASE);
    });
  });

  describe('Keyboard handling', () => {
    test('handles uppercase E key', () => {
      recognizer.handleKeyDown({ key: 'E' });
      expect(state.gesture.isEraseKeyPressed).toBe(true);

      recognizer.handleKeyUp({ key: 'E' });
      expect(state.gesture.isEraseKeyPressed).toBe(false);
    });

    test('handles lowercase e key', () => {
      recognizer.handleKeyDown({ key: 'e' });
      expect(state.gesture.isEraseKeyPressed).toBe(true);

      recognizer.handleKeyUp({ key: 'e' });
      expect(state.gesture.isEraseKeyPressed).toBe(false);
    });

    test('ignores other keys', () => {
      recognizer.handleKeyDown({ key: 'a' });
      expect(state.gesture.isEraseKeyPressed).toBe(false);
      expect(state.gesture.currentGesture).toBe(GestureType.NONE);
    });
  });
});
