import { type GestureHandler } from '../gesture-types';
import { state, addStroke } from '../../state';
import { screenToWorld } from '../../utils/transform';
import { renderStrokeLayer } from '../../canvas/stroke-layer';
import { generateId } from '../../utils/math';
import { type Stroke } from '../../types';

export class DrawHandler implements GestureHandler {
  onStart(event: PointerEvent): void {
    const worldPoint = screenToWorld(event.clientX, event.clientY);

    state.currentStroke = {
      points: [worldPoint],
      startTime: Date.now()
    };
  }

  onMove(event: PointerEvent): void {
    if (!state.currentStroke) {
      return;
    }

    const worldPoint = screenToWorld(event.clientX, event.clientY);
    state.currentStroke.points.push(worldPoint);

    requestAnimationFrame(() => renderStrokeLayer());
  }

  onEnd(_event: PointerEvent): void {
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

    requestAnimationFrame(() => renderStrokeLayer());
  }
}

