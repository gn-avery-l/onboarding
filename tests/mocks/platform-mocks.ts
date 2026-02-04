import {
  type InputAdapter,
  type PointerInputEvent,
  type KeyInputEvent
} from '../../src/ts/core/platform/input-adapter';
import {
  type RenderAdapter,
  type RenderContext
} from '../../src/ts/core/platform/render-adapter';
import { type SchedulerAdapter } from '../../src/ts/core/platform/scheduler-adapter';

/**
 * Mock input adapter for testing
 */
export class MockInputAdapter implements InputAdapter {
  convertPointerEvent(event: any): PointerInputEvent {
    return {
      pointerId: event.pointerId || 0,
      x: event.x || 0,
      y: event.y || 0
    };
  }

  convertKeyEvent(event: any): KeyInputEvent {
    return {
      key: event.key || ''
    };
  }
}

/**
 * Mock render adapter that tracks calls for testing
 */
export class MockRenderAdapter implements RenderAdapter {
  public calls: Array<{ method: string; args: any[] }> = [];
  private context: RenderContext = { width: 800, height: 600 };

  clear(): void {
    this.calls.push({ method: 'clear', args: [] });
  }

  save(): void {
    this.calls.push({ method: 'save', args: [] });
  }

  restore(): void {
    this.calls.push({ method: 'restore', args: [] });
  }

  translate(x: number, y: number): void {
    this.calls.push({ method: 'translate', args: [x, y] });
  }

  scale(x: number, y: number): void {
    this.calls.push({ method: 'scale', args: [x, y] });
  }

  setStrokeStyle(color: string, width: number): void {
    this.calls.push({ method: 'setStrokeStyle', args: [color, width] });
  }

  beginPath(): void {
    this.calls.push({ method: 'beginPath', args: [] });
  }

  moveTo(x: number, y: number): void {
    this.calls.push({ method: 'moveTo', args: [x, y] });
  }

  lineTo(x: number, y: number): void {
    this.calls.push({ method: 'lineTo', args: [x, y] });
  }

  stroke(): void {
    this.calls.push({ method: 'stroke', args: [] });
  }

  setFillStyle(color: string): void {
    this.calls.push({ method: 'setFillStyle', args: [color] });
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.calls.push({ method: 'fillRect', args: [x, y, width, height] });
  }

  arc(x: number, y: number, radius: number): void {
    this.calls.push({ method: 'arc', args: [x, y, radius] });
  }

  fill(): void {
    this.calls.push({ method: 'fill', args: [] });
  }

  drawImage(image: any, x: number, y: number, width: number, height: number): void {
    this.calls.push({ method: 'drawImage', args: [image, x, y, width, height] });
  }

  getContext(): RenderContext {
    return this.context;
  }

  resetCalls(): void {
    this.calls = [];
  }
}

/**
 * Mock scheduler that executes callbacks immediately for testing
 */
export class MockSchedulerAdapter implements SchedulerAdapter {
  public scheduledCallbacks: Array<() => void> = [];

  scheduleRender(callback: () => void): void {
    this.scheduledCallbacks.push(callback);
    // Execute immediately for synchronous testing
    callback();
  }

  resetCallbacks(): void {
    this.scheduledCallbacks = [];
  }
}
