import { type PointerInputEvent } from '../platform/input-adapter';

export interface GestureHandler {
  onStart(event: PointerInputEvent): void;
  onMove(event: PointerInputEvent): void;
  onEnd(event: PointerInputEvent): void;
}
