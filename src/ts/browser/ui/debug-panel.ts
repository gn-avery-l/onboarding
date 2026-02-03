import { state } from '../../core/state';

export class DebugPanel {
  private gestureElement: HTMLElement;
  private touchesElement: HTMLElement;
  private panElement: HTMLElement;
  private zoomElement: HTMLElement;
  private debugStrokesElement: HTMLElement;

  constructor() {
    this.gestureElement = document.querySelector('p.gesture span')!;
    this.touchesElement = document.querySelector('p.touches span')!;
    this.panElement = document.querySelector('p.pan span')!;
    this.zoomElement = document.querySelector('p.zoom span')!;
    this.debugStrokesElement = document.querySelector('p.strokes span')!;
  }

  public update(): void {
    this.gestureElement.textContent = state.gesture.currentGesture;
    this.touchesElement.textContent = state.gesture.touches.size.toString();
    this.panElement.textContent = `${Math.round(state.view.panX)}, ${Math.round(state.view.panY)}`;
    this.zoomElement.textContent = `${Math.round(state.view.zoom * 100)}%`;
    this.debugStrokesElement.textContent = state.debug.showStrokePoints
      ? 'true'
      : 'false';
  }
}
