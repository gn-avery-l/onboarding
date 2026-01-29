export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  timestamp: number;
}

export interface InProgressStroke {
  points: Point[];
  startTime: number;
}

export interface ViewTransform {
  panX: number;
  panY: number;
  zoom: number;
}

export interface ViewState extends ViewTransform {
  minZoom: number;
  maxZoom: number;
}

export enum GestureType {
  NONE = 'none',
  DRAW = 'draw',
  PAN = 'pan',
  ZOOM = 'zoom',
  ERASE = 'erase'
}

export interface TouchInfo {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
}

export interface GestureState {
  currentGesture: GestureType;
  touches: Map<number, TouchInfo>;
  isEraseKeyPressed: boolean;
  initialPinchDistance?: number;
  initialZoom?: number;
}

export interface BackgroundImage {
  id: string;
  url: string;
  thumbnail: string;
  loaded: boolean;
  image?: HTMLImageElement;
}

export interface BackgroundState {
  currentBackground: BackgroundImage | null;
  availableBackgrounds: BackgroundImage[];
  pickerVisible: boolean;
}

export interface AppState {
  strokes: Stroke[];
  currentStroke: InProgressStroke | null;
  view: ViewState;
  gesture: GestureState;
  background: BackgroundState;
  canvases: {
    background: HTMLCanvasElement | null;
    strokes: HTMLCanvasElement | null;
  };
  debug: {
    gestureType: string;
    touchCount: number;
    panX: number;
    panY: number;
    zoom: number;
    showStrokePoints: boolean;
  };
}

