import '../../styles/global.css';
import { initCanvasManager, canvasManager } from './canvas-manager';
import { GestureRecognizer } from '../core/gestures/gesture-recognizer';
import { DebugPanel } from './ui/debug-panel';
import { BackgroundPicker } from './ui/background-picker';
import {
  clearStrokes,
  clearBackground,
  updateViewTransform,
  state
} from '../core/state';
import { renderStrokeLayer } from '../core/canvas/stroke-layer';
import { renderBackgroundLayer } from '../core/canvas/background-layer';
import { initPlatform, getPlatform } from '../core/platform/platform-context';
import { BrowserInputAdapter } from './adapters/browser-input-adapter';
import { BrowserSchedulerAdapter } from './adapters/browser-scheduler-adapter';
import { Canvas2DRenderAdapter } from './adapters/browser-render-adapter';

let gestureRecognizer: GestureRecognizer;
let debugPanel: DebugPanel;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize canvas manager (browser-specific)
  initCanvasManager();

  // Initialize platform adapters
  const inputAdapter = new BrowserInputAdapter();
  const schedulerAdapter = new BrowserSchedulerAdapter();
  const backgroundRenderer = new Canvas2DRenderAdapter(
    canvasManager.getBackgroundContext()
  );
  const strokeRenderer = new Canvas2DRenderAdapter(
    canvasManager.getStrokeContext()
  );

  initPlatform({
    input: inputAdapter,
    scheduler: schedulerAdapter,
    backgroundRenderer,
    strokeRenderer
  });

  // Mark canvas manager as initialized so resize handler can safely render
  canvasManager.markInitialized();

  // Initial render now that platform is ready
  canvasManager.renderAll();

  // Initialize platform-agnostic components
  gestureRecognizer = new GestureRecognizer();
  debugPanel = new DebugPanel();
  new BackgroundPicker();

  setupEventListeners();

  debugPanel.update();
});

function handlePointerDown(e: PointerEvent): void {
  e.preventDefault();
  const platform = getPlatform();
  const event = platform.input.convertPointerEvent(e);
  gestureRecognizer.handlePointerDown(event);
  debugPanel.update();
}

function handlePointerMove(e: PointerEvent): void {
  e.preventDefault();
  const platform = getPlatform();
  const event = platform.input.convertPointerEvent(e);
  gestureRecognizer.handlePointerMove(event);
  debugPanel.update();
}

function handlePointerUp(e: PointerEvent): void {
  e.preventDefault();
  const platform = getPlatform();
  const event = platform.input.convertPointerEvent(e);
  gestureRecognizer.handlePointerUp(event);
  debugPanel.update();
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'e' || e.key === 'E') {
    const canvas = document.querySelector('canvas.stroke');
    if (canvas) {
      canvas.classList.add('erase-mode');
    }
  }

  const platform = getPlatform();
  const event = platform.input.convertKeyEvent(e);
  gestureRecognizer.handleKeyDown(event);
  debugPanel.update();
}

function handleKeyUp(e: KeyboardEvent): void {
  if (e.key === 'e' || e.key === 'E') {
    const canvas = document.querySelector('canvas.stroke');
    if (canvas) {
      canvas.classList.remove('erase-mode');
    }
  }

  const platform = getPlatform();
  const event = platform.input.convertKeyEvent(e);
  gestureRecognizer.handleKeyUp(event);
  debugPanel.update();
}

function handleClear(): void {
  clearStrokes();
  renderStrokeLayer();
}

function handleReset(): void {
  clearStrokes();
  clearBackground();
  updateViewTransform({ panX: 0, panY: 0, zoom: 1.0 });
  renderBackgroundLayer();
  renderStrokeLayer();
  debugPanel.update();
}

function handleToggleDebugStrokes(): void {
  state.debug.showStrokePoints = !state.debug.showStrokePoints;
  renderStrokeLayer();
  debugPanel.update();
}

function setupEventListeners(): void {
  const canvas = document.querySelector('canvas.stroke') as HTMLCanvasElement;

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  const clearButton = document.querySelector('button.clear');
  if (clearButton) {
    clearButton.addEventListener('click', handleClear);
  }

  const resetButton = document.querySelector('button.reset');
  if (resetButton) {
    resetButton.addEventListener('click', handleReset);
  }

  const debugStrokesButton = document.querySelector('button.strokes');
  if (debugStrokesButton) {
    debugStrokesButton.addEventListener('click', handleToggleDebugStrokes);
  }
}

// Expose state for E2E testing (only in dev mode)
if (import.meta.env.DEV) {
  // @ts-ignore - Expose for E2E tests
  window.state = state;
  // @ts-ignore
  window.renderStrokeLayer = renderStrokeLayer;
  // @ts-ignore
  window.renderBackgroundLayer = renderBackgroundLayer;
}
