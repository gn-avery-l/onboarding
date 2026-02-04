import { describe, test, expect, beforeEach } from 'vitest';
import { renderStrokeLayer } from '../../src/ts/core/canvas/stroke-layer';
import { renderBackgroundLayer } from '../../src/ts/core/canvas/background-layer';
import { Canvas2DRenderAdapter } from '../../src/ts/browser/adapters/browser-render-adapter';
import { initPlatform } from '../../src/ts/core/platform/platform-context';
import { state, clearStrokes } from '../../src/ts/core/state';
import {
  MockInputAdapter,
  MockSchedulerAdapter
} from '../mocks/platform-mocks';

describe('Browser Rendering Integration Tests', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let adapter: Canvas2DRenderAdapter;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d')!;

    adapter = new Canvas2DRenderAdapter(ctx);

    initPlatform({
      input: new MockInputAdapter(),
      scheduler: new MockSchedulerAdapter(),
      backgroundRenderer: adapter,
      strokeRenderer: adapter
    });

    clearStrokes();
    state.view.panX = 0;
    state.view.panY = 0;
    state.view.zoom = 1.0;
    state.debug.showStrokePoints = false;
    state.background.currentBackground = null;
  });

  describe('renderStrokeLayer integration', () => {
    test('renders without errors when no strokes exist', () => {
      expect(() => renderStrokeLayer()).not.toThrow();
    });

    test('renders single stroke with real adapter', () => {
      state.strokes = [
        {
          id: 'stroke-1',
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
            { x: 20, y: 20 }
          ],
          timestamp: Date.now()
        }
      ];
      expect(() => renderStrokeLayer()).not.toThrow();
    });

    test('renders multiple strokes with real adapter', () => {
      state.strokes = [
        {
          id: 'stroke-1',
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 }
          ],
          timestamp: Date.now()
        },
        {
          id: 'stroke-2',
          points: [
            { x: 20, y: 20 },
            { x: 30, y: 30 }
          ],
          timestamp: Date.now()
        },
        {
          id: 'stroke-3',
          points: [
            { x: 40, y: 40 },
            { x: 50, y: 50 }
          ],
          timestamp: Date.now()
        }
      ];
      expect(() => renderStrokeLayer()).not.toThrow();
    });

    test('renders current stroke with real adapter', () => {
      state.currentStroke = {
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 5 },
          { x: 10, y: 10 }
        ],
        startTime: Date.now()
      };
      expect(() => renderStrokeLayer()).not.toThrow();
    });

    test('applies view transformations with real adapter', () => {
      state.strokes = [
        {
          id: 'stroke-1',
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 100 }
          ],
          timestamp: Date.now()
        }
      ];
      state.view.panX = 50;
      state.view.panY = 75;
      state.view.zoom = 2.0;
      expect(() => renderStrokeLayer()).not.toThrow();
    });

    test('handles rapid stroke additions', () => {
      for (let i = 0; i < 50; i++) {
        state.strokes.push({
          id: `stroke-${i}`,
          points: [
            { x: i, y: i },
            { x: i + 5, y: i + 5 }
          ],
          timestamp: Date.now() + i
        });
      }
      expect(() => renderStrokeLayer()).not.toThrow();
    });

    test('handles strokes with many points', () => {
      const points = [];
      for (let i = 0; i < 1000; i++) {
        points.push({ x: i, y: Math.sin(i / 10) * 100 });
      }
      state.strokes = [
        {
          id: 'complex-stroke',
          points,
          timestamp: Date.now()
        }
      ];
      expect(() => renderStrokeLayer()).not.toThrow();
    });

    test('handles extreme zoom levels', () => {
      state.strokes = [
        {
          id: 'stroke-1',
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 }
          ],
          timestamp: Date.now()
        }
      ];
      state.view.zoom = 0.1;
      expect(() => renderStrokeLayer()).not.toThrow();

      state.view.zoom = 5.0;
      expect(() => renderStrokeLayer()).not.toThrow();
    });

    test('handles large pan offsets', () => {
      state.strokes = [
        {
          id: 'stroke-1',
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 }
          ],
          timestamp: Date.now()
        }
      ];
      state.view.panX = 10000;
      state.view.panY = -10000;
      expect(() => renderStrokeLayer()).not.toThrow();
    });
  });

  describe('renderBackgroundLayer integration', () => {
    test('renders without errors when no background exists', () => {
      expect(() => renderBackgroundLayer()).not.toThrow();
    });

    test('renders with loaded background', () => {
      const img = new Image();
      img.width = 100;
      img.height = 100;
      state.background.currentBackground = {
        id: 'test-bg',
        url: 'test.png',
        thumbnail: 'test-thumb.png',
        loaded: true,
        image: img
      };
      expect(() => renderBackgroundLayer()).not.toThrow();
    });

    test('applies view transformations to background', () => {
      const img = new Image();
      img.width = 100;
      img.height = 100;
      state.background.currentBackground = {
        id: 'test-bg',
        url: 'test.png',
        thumbnail: 'test-thumb.png',
        loaded: true,
        image: img
      };
      state.view.panX = 100;
      state.view.panY = 200;
      state.view.zoom = 1.5;
      expect(() => renderBackgroundLayer()).not.toThrow();
    });
  });
});

