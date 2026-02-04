// Platform-agnostic input event types
export interface PointerInputEvent {
  pointerId: number | string;
  x: number;
  y: number;
}

export interface KeyInputEvent {
  key: string;
}

// Platform adapter interface for input handling
export interface InputAdapter {
  convertPointerEvent(event: any): PointerInputEvent;
  convertKeyEvent(event: any): KeyInputEvent;
}
