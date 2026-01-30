import { type GestureHandler } from '../gesture-types';
import { state, updateViewTransform } from '../../state';
import { renderBackgroundLayer } from '../../canvas/background-layer';
import { renderStrokeLayer } from '../../canvas/stroke-layer';
import { type Point } from '../../types';

export class PanHandler implements GestureHandler {
  private startPanX: number = 0;
  private startPanY: number = 0;
  private initialTouches: Point[] = [];

  onStart(_event: PointerEvent): void {
    this.startPanX = state.view.panX;
    this.startPanY = state.view.panY;

    this.initialTouches = Array.from(state.gesture.touches.values()).map(
      (t) => ({
        x: t.currentX,
        y: t.currentY
      })
    );
  }

  onMove(_event: PointerEvent): void {
    if (state.gesture.touches.size !== 2) {
      return;
    }

    const currentTouches = Array.from(state.gesture.touches.values());

    const currentCentroidX =
      (currentTouches[0].currentX + currentTouches[1].currentX) / 2;
    const currentCentroidY =
      (currentTouches[0].currentY + currentTouches[1].currentY) / 2;

    const initialCentroidX =
      (this.initialTouches[0].x + this.initialTouches[1].x) / 2;
    const initialCentroidY =
      (this.initialTouches[0].y + this.initialTouches[1].y) / 2;

    const deltaX = currentCentroidX - initialCentroidX;
    const deltaY = currentCentroidY - initialCentroidY;

    updateViewTransform({
      panX: this.startPanX + deltaX,
      panY: this.startPanY + deltaY
    });

    state.debug.panX = state.view.panX;
    state.debug.panY = state.view.panY;

    requestAnimationFrame(() => {
      renderBackgroundLayer();
      renderStrokeLayer();
    });
  }

  onEnd(_event: PointerEvent): void {
    // Nothing to clean up
  }
}

