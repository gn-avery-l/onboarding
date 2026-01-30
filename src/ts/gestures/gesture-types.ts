export interface GestureHandler {
  onStart(event: PointerEvent): void;
  onMove(event: PointerEvent): void;
  onEnd(event: PointerEvent): void;
}
