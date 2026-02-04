import {
  type InputAdapter,
  type PointerInputEvent,
  type KeyInputEvent
} from '../../core/platform/input-adapter';

export class BrowserInputAdapter implements InputAdapter {
  convertPointerEvent(event: PointerEvent): PointerInputEvent {
    return {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
  }

  convertKeyEvent(event: KeyboardEvent): KeyInputEvent {
    return {
      key: event.key
    };
  }
}
