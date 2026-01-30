import { describe, test, expect, beforeEach } from 'vitest';
import {
  state,
  updateViewTransform,
  addStroke,
  clearStrokes,
  clearBackground
} from '../../src/ts/state';

describe('updateViewTransform', () => {
  beforeEach(() => {
    state.view.panX = 0;
    state.view.panY = 0;
    state.view.zoom = 1.0;
  });

  test('updates zoom', () => {
    updateViewTransform({ zoom: 2.0 });
    expect(state.view.zoom).toBe(2.0);
  });

  test('clamps zoom to minZoom', () => {
    updateViewTransform({ zoom: 0.05 });
    expect(state.view.zoom).toBe(0.1);
  });

  test('clamps zoom to maxZoom', () => {
    updateViewTransform({ zoom: 10.0 });
    expect(state.view.zoom).toBe(5.0);
  });

  test('allows zoom at minZoom boundary', () => {
    updateViewTransform({ zoom: 0.1 });
    expect(state.view.zoom).toBe(0.1);
  });

  test('allows zoom at maxZoom boundary', () => {
    updateViewTransform({ zoom: 5.0 });
    expect(state.view.zoom).toBe(5.0);
  });

  test('updates panX', () => {
    updateViewTransform({ panX: 100 });
    expect(state.view.panX).toBe(100);
  });

  test('updates panY', () => {
    updateViewTransform({ panY: 200 });
    expect(state.view.panY).toBe(200);
  });

  test('updates partially', () => {
    state.view.panX = 10;
    state.view.panY = 20;
    state.view.zoom = 1.5;

    updateViewTransform({ panX: 50 });

    expect(state.view.panX).toBe(50);
    expect(state.view.panY).toBe(20);
    expect(state.view.zoom).toBe(1.5);
  });

  test('handles negative pan values', () => {
    updateViewTransform({ panX: -100, panY: -200 });
    expect(state.view.panX).toBe(-100);
    expect(state.view.panY).toBe(-200);
  });
});

describe('addStroke', () => {
  beforeEach(() => {
    state.strokes = [];
  });

  test('adds stroke to empty array', () => {
    const stroke = { id: '1', points: [], timestamp: 123 };
    addStroke(stroke);
    expect(state.strokes).toHaveLength(1);
    expect(state.strokes[0]).toBe(stroke);
  });

  test('adds multiple strokes', () => {
    const stroke1 = { id: '1', points: [], timestamp: 123 };
    const stroke2 = { id: '2', points: [], timestamp: 124 };

    addStroke(stroke1);
    addStroke(stroke2);

    expect(state.strokes).toHaveLength(2);
    expect(state.strokes[0]).toBe(stroke1);
    expect(state.strokes[1]).toBe(stroke2);
  });

  test('maintains insertion order', () => {
    const strokes = [
      { id: 'a', points: [], timestamp: 1 },
      { id: 'b', points: [], timestamp: 2 },
      { id: 'c', points: [], timestamp: 3 }
    ];

    strokes.forEach(addStroke);

    expect(state.strokes.map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('clearStrokes', () => {
  test('clears strokes array', () => {
    state.strokes = [
      { id: '1', points: [], timestamp: 1 },
      { id: '2', points: [], timestamp: 2 }
    ];

    clearStrokes();

    expect(state.strokes).toHaveLength(0);
  });

  test('clears currentStroke', () => {
    state.currentStroke = { points: [{ x: 1, y: 2 }], startTime: 123 };

    clearStrokes();

    expect(state.currentStroke).toBeNull();
  });

  test('works when already empty', () => {
    state.strokes = [];
    state.currentStroke = null;

    clearStrokes();

    expect(state.strokes).toHaveLength(0);
    expect(state.currentStroke).toBeNull();
  });
});

describe('clearBackground', () => {
  test('clears current background', () => {
    state.background.currentBackground = {
      id: 'test',
      url: 'http://example.com',
      thumbnail: 'http://example.com',
      loaded: true
    };

    clearBackground();

    expect(state.background.currentBackground).toBeNull();
  });

  test('works when already null', () => {
    state.background.currentBackground = null;

    clearBackground();

    expect(state.background.currentBackground).toBeNull();
  });
});

