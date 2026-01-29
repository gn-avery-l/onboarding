import { state } from '../state';
import { GestureType, type TouchInfo } from '../types';
import { type GestureHandler } from './gesture-types';
import { DrawHandler } from './handlers/draw-handler';
import { PanHandler } from './handlers/pan-handler';
import { ZoomHandler } from './handlers/zoom-handler';
import { EraseHandler } from './handlers/erase-handler';
import { distance } from '../utils/math';

export class GestureRecognizer {
  private handlers: Map<GestureType, GestureHandler>;

  constructor() {
    this.handlers = new Map();
    this.handlers.set(GestureType.DRAW, new DrawHandler());
    this.handlers.set(GestureType.PAN, new PanHandler());
    this.handlers.set(GestureType.ZOOM, new ZoomHandler());
    this.handlers.set(GestureType.ERASE, new EraseHandler());
  }

  private determineGesture(): GestureType {
    const touchCount = state.gesture.touches.size;

    if (touchCount === 1 && state.gesture.isEraseKeyPressed) {
      return GestureType.ERASE;
    }

    if (touchCount === 2) {
      if (this.isPinchGesture()) {
        return GestureType.ZOOM;
      }
      return GestureType.PAN;
    }

    if (touchCount === 1) {
      return GestureType.DRAW;
    }

    return GestureType.NONE;
  }

  private isPinchGesture(): boolean {
    if (state.gesture.touches.size !== 2) {
      return false;
    }

    const touches = Array.from(state.gesture.touches.values());
    const currentDistance = distance(touches[0], touches[1]);

    if (state.gesture.initialPinchDistance === undefined) {
      state.gesture.initialPinchDistance = currentDistance;
      return false;
    }

    const distanceChange = Math.abs(
      currentDistance - state.gesture.initialPinchDistance
    );
    return distanceChange > 50;
  }

  private startGesture(gesture: GestureType): void {
    state.gesture.currentGesture = gesture;
    state.debug.gestureType = gesture;
  }

  private endGesture(): void {
    const handler = this.handlers.get(state.gesture.currentGesture);
    if (handler) {
      const event = new PointerEvent('pointerup');
      handler.onEnd(event);
    }
  }

  public handlePointerDown(event: PointerEvent): void {
    const touchInfo: TouchInfo = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startTime: Date.now()
    };

    state.gesture.touches.set(event.pointerId, touchInfo);
    state.debug.touchCount = state.gesture.touches.size;

    const newGesture = this.determineGesture();

    if (newGesture !== state.gesture.currentGesture) {
      this.endGesture();
      this.startGesture(newGesture);
    }

    const handler = this.handlers.get(state.gesture.currentGesture);
    if (handler) {
      handler.onStart(event);
    }
  }

  public handlePointerMove(event: PointerEvent): void {
    if (!state.gesture.touches.has(event.pointerId)) {
      return;
    }

    const touch = state.gesture.touches.get(event.pointerId)!;
    touch.currentX = event.clientX;
    touch.currentY = event.clientY;

    const newGesture = this.determineGesture();
    if (newGesture !== state.gesture.currentGesture) {
      this.endGesture();
      this.startGesture(newGesture);
      const handler = this.handlers.get(state.gesture.currentGesture);
      if (handler) {
        handler.onStart(event);
      }
    }

    const handler = this.handlers.get(state.gesture.currentGesture);
    if (handler) {
      handler.onMove(event);
    }
  }

  public handlePointerUp(event: PointerEvent): void {
    const handler = this.handlers.get(state.gesture.currentGesture);
    if (handler) {
      handler.onEnd(event);
    }

    state.gesture.touches.delete(event.pointerId);
    state.debug.touchCount = state.gesture.touches.size;

    const newGesture = this.determineGesture();
    if (newGesture !== state.gesture.currentGesture) {
      this.endGesture();
      if (newGesture !== GestureType.NONE) {
        this.startGesture(newGesture);
      } else {
        state.gesture.currentGesture = GestureType.NONE;
        state.debug.gestureType = 'none';
      }
    }

    if (state.gesture.touches.size < 2) {
      state.gesture.initialPinchDistance = undefined;
    }
  }

  public handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'e' || event.key === 'E') {
      state.gesture.isEraseKeyPressed = true;

      if (state.gesture.currentGesture === GestureType.DRAW) {
        this.endGesture();
        this.startGesture(GestureType.ERASE);
      }
    }
  }

  public handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'e' || event.key === 'E') {
      state.gesture.isEraseKeyPressed = false;

      if (state.gesture.currentGesture === GestureType.ERASE) {
        this.endGesture();
        if (state.gesture.touches.size === 1) {
          this.startGesture(GestureType.DRAW);
        }
      }
    }
  }
}

