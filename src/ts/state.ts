import {
  type AppState,
  type Stroke,
  type ViewTransform,
  GestureType
} from './types';

export const state: AppState = {
  strokes: [],
  currentStroke: null,
  view: {
    panX: 0,
    panY: 0,
    zoom: 1.0,
    minZoom: 0.1,
    maxZoom: 5.0
  },
  gesture: {
    currentGesture: GestureType.NONE,
    touches: new Map(),
    isEraseKeyPressed: false
  },
  background: {
    currentBackground: null,
    availableBackgrounds: [],
    pickerVisible: false
  },
  canvases: {
    background: null,
    strokes: null
  },
  debug: {
    gestureType: 'none',
    touchCount: 0,
    panX: 0,
    panY: 0,
    zoom: 1.0,
    showStrokePoints: false
  }
};

export function updateViewTransform(transform: Partial<ViewTransform>): void {
  if (transform.panX !== undefined) {
    state.view.panX = transform.panX;
  }
  if (transform.panY !== undefined) {
    state.view.panY = transform.panY;
  }
  if (transform.zoom !== undefined) {
    state.view.zoom = Math.max(
      state.view.minZoom,
      Math.min(state.view.maxZoom, transform.zoom)
    );
  }
}

export function addStroke(stroke: Stroke): void {
  state.strokes.push(stroke);
}

export function clearStrokes(): void {
  state.strokes.length = 0;
  state.currentStroke = null;
}

export function clearBackground(): void {
  state.background.currentBackground = null;
}

