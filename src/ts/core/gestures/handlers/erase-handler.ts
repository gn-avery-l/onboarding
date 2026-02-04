import { type GestureHandler } from '../gesture-types';
import { state } from '../../state';
import { screenToWorld } from '../../utils/transform';
import { distance, generateId } from '../../utils/math';
import { renderStrokeLayer } from '../../canvas/stroke-layer';
import { type Stroke, type Point } from '../../types';
import { type PointerInputEvent } from '../../platform/input-adapter';
import { getPlatform } from '../../platform/platform-context';

export class EraseHandler implements GestureHandler {
  private readonly ERASE_RADIUS = 20;

  onStart(event: PointerInputEvent): void {
    this.eraseAtPoint(event.x, event.y);
  }

  onMove(event: PointerInputEvent): void {
    this.eraseAtPoint(event.x, event.y);
  }

  onEnd(event: PointerInputEvent): void {
    this.eraseAtPoint(event.x, event.y);
  }

  private eraseAtPoint(screenX: number, screenY: number): void {
    const worldPoint = screenToWorld(screenX, screenY);
    const worldEraseRadius = this.ERASE_RADIUS / state.view.zoom;

    const newStrokes: Stroke[] = [];
    const strokesModified: boolean[] = [];

    for (let i = 0; i < state.strokes.length; i++) {
      const stroke = state.strokes[i];
      const segments = this.splitStroke(stroke, worldPoint, worldEraseRadius);

      if (segments.length === 0) {
        // Stroke completely erased
        strokesModified[i] = true;
      } else if (
        segments.length === 1 &&
        segments[0].points.length === stroke.points.length
      ) {
        // Stroke untouched, no need to recreate
        strokesModified[i] = false;
      } else {
        // Stroke partially erased, replace with segments
        strokesModified[i] = true;
        newStrokes.push(...segments);
      }
    }

    if (strokesModified.some((modified) => modified)) {
      state.strokes = state.strokes
        .filter((_, i) => !strokesModified[i])
        .concat(newStrokes);
      getPlatform().scheduler.scheduleRender(() => renderStrokeLayer());
    }
  }

  private splitStroke(
    stroke: Stroke,
    eraseCenter: Point,
    eraseRadius: number
  ): Stroke[] {
    const segments: Stroke[] = [];
    let currentSegment: Point[] = [];

    for (let i = 0; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      const dist = distance(point, eraseCenter);

      if (dist > eraseRadius) {
        // Points are outside of eraser radius,
        // so we save them
        currentSegment.push(point);
      } else {
        // Points are inside radius so we start cutting

        // Record any existing segments we've been saving
        if (currentSegment.length > 0) {
          segments.push({
            id: generateId(),
            points: currentSegment,
            timestamp: stroke.timestamp
          });

          currentSegment = [];
        }
      }
    }

    // Save final segment
    if (currentSegment.length > 0) {
      segments.push({
        id: generateId(),
        points: currentSegment,
        timestamp: stroke.timestamp
      });
    }

    return segments;
  }
}
