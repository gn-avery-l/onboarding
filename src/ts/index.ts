import '../styles/global.css';
import { initCanvasManager } from './canvas/canvas-manager';
import { GestureRecognizer } from './gestures/gesture-recognizer';
import { DebugPanel } from './ui/debug-panel';
import { BackgroundPicker } from './ui/background-picker';
import {
  clearStrokes,
  clearBackground,
  updateViewTransform,
  state
} from './state';
import { renderStrokeLayer } from './canvas/stroke-layer';
import { renderBackgroundLayer } from './canvas/background-layer';

let gestureRecognizer: GestureRecognizer;
let debugPanel: DebugPanel;

document.addEventListener('DOMContentLoaded', () => {
  initCanvasManager();

  gestureRecognizer = new GestureRecognizer();
  debugPanel = new DebugPanel();
  new BackgroundPicker();

  setupEventListeners();

  debugPanel.update();
});

function handlePointerDown(e: PointerEvent): void {
  e.preventDefault();
  gestureRecognizer.handlePointerDown(e);
  debugPanel.update();
}

function handlePointerMove(e: PointerEvent): void {
  e.preventDefault();
  gestureRecognizer.handlePointerMove(e);
  debugPanel.update();
}

function handlePointerUp(e: PointerEvent): void {
  e.preventDefault();
  gestureRecognizer.handlePointerUp(e);
  debugPanel.update();
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'e' || e.key === 'E') {
    const canvas = document.querySelector('canvas.stroke');
    if (canvas) {
      canvas.classList.add('erase-mode');
    }
  }

  gestureRecognizer.handleKeyDown(e);
  debugPanel.update();
}

function handleKeyUp(e: KeyboardEvent): void {
  if (e.key === 'e' || e.key === 'E') {
    const canvas = document.querySelector('canvas.stroke');
    if (canvas) {
      canvas.classList.remove('erase-mode');
    }
  }

  gestureRecognizer.handleKeyUp(e);
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

