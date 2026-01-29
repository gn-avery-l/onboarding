import { type GestureHandler } from '../gesture-types';
import { state, updateViewTransform } from '../../state';
import { renderBackgroundLayer } from '../../canvas/background-layer';
import { renderStrokeLayer } from '../../canvas/stroke-layer';
import { distance } from '../../utils/math';
import { screenToWorld, worldToScreen } from '../../utils/transform';
import { type Point } from '../../types';

export class ZoomHandler implements GestureHandler {
  private initialDistance: number = 0;
  private initialZoom: number = 1;
  private zoomCenter: Point = { x: 0, y: 0 };
  private readonly ZOOM_SENSITIVITY = 0.005;
  private readonly MIN_DISTANCE = 50;

  onStart(_event: PointerEvent): void {
    if (state.gesture.touches.size !== 2) {
      return;
    }

    const touches = Array.from(state.gesture.touches.values());
    const dist = distance(touches[0], touches[1]);
    this.initialDistance = Math.max(dist, this.MIN_DISTANCE);
    this.initialZoom = state.view.zoom;

    this.zoomCenter = {
      x: (touches[0].currentX + touches[1].currentX) / 2,
      y: (touches[0].currentY + touches[1].currentY) / 2
    };
  }

  onMove(_event: PointerEvent): void {
    if (state.gesture.touches.size !== 2 || this.initialDistance === 0) {
      return;
    }

    const touches = Array.from(state.gesture.touches.values());
    const currentDistance = distance(touches[0], touches[1]);

    const distanceDelta = currentDistance - this.initialDistance;
    const zoomDelta = distanceDelta * this.ZOOM_SENSITIVITY;
    let newZoom = this.initialZoom * (1 + zoomDelta);

    newZoom = Math.max(
      state.view.minZoom,
      Math.min(state.view.maxZoom, newZoom)
    );

    const worldBeforeZoom = screenToWorld(
      this.zoomCenter.x,
      this.zoomCenter.y,
      state.view
    );

    const tempView = { ...state.view, zoom: newZoom };

    const screenAfterZoom = worldToScreen(
      worldBeforeZoom.x,
      worldBeforeZoom.y,
      tempView
    );

    const panAdjustX = this.zoomCenter.x - screenAfterZoom.x;
    const panAdjustY = this.zoomCenter.y - screenAfterZoom.y;

    updateViewTransform({
      zoom: newZoom,
      panX: state.view.panX + panAdjustX,
      panY: state.view.panY + panAdjustY
    });

    state.debug.zoom = newZoom;
    state.debug.panX = state.view.panX;
    state.debug.panY = state.view.panY;

    requestAnimationFrame(() => {
      renderBackgroundLayer();
      renderStrokeLayer();
    });
  }

  onEnd(_event: PointerEvent): void {
    state.gesture.initialPinchDistance = undefined;
  }
}
