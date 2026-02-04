import { type GestureHandler } from '../gesture-types';
import { state, addStroke } from '../../state';
import { screenToWorld } from '../../utils/transform';
import { renderStrokeLayer } from '../../canvas/stroke-layer';
import { generateId } from '../../utils/math';
import { type Stroke } from '../../types';
import { type PointerInputEvent } from '../../platform/input-adapter';
import { getPlatform } from '../../platform/platform-context';

export class DrawHandler implements GestureHandler {
  onStart(event: PointerInputEvent): void {
    const worldPoint = screenToWorld(event.x, event.y);

    state.currentStroke = {
      points: [worldPoint],
      startTime: Date.now()
    };
  }

  onMove(event: PointerInputEvent): void {
    if (!state.currentStroke) {
      return;
    }

    const worldPoint = screenToWorld(event.x, event.y);
    state.currentStroke.points.push(worldPoint);

    getPlatform().scheduler.scheduleRender(() => renderStrokeLayer());
  }

  onEnd(_event: PointerInputEvent): void {
    if (!state.currentStroke) {
      return;
    }

    const stroke: Stroke = {
      id: generateId(),
      points: state.currentStroke.points,
      timestamp: state.currentStroke.startTime
    };

    addStroke(stroke);
    state.currentStroke = null;

    getPlatform().scheduler.scheduleRender(() => renderStrokeLayer());
  }
}
