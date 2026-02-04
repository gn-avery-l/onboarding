import { state } from '../state';
import { type Point } from '../types';
import { getPlatform } from '../platform/platform-context';
import { type RenderAdapter } from '../platform/render-adapter';

const STROKE_COLOUR = '#000000';
const STROKE_COLOUR_NEW = '#ff0000';
const STROKE_WIDTH = 2;

export function renderStrokeLayer(): void {
  const renderer = getPlatform().strokeRenderer;
  renderer.clear();

  renderer.save();
  renderer.translate(state.view.panX, state.view.panY);
  renderer.scale(state.view.zoom, state.view.zoom);

  // Existing strokes
  for (const stroke of state.strokes) {
    renderStrokePoints(renderer, stroke.points, STROKE_COLOUR, STROKE_WIDTH);
  }

  // Newly drawn strokes
  if (state.currentStroke) {
    renderStrokePoints(
      renderer,
      state.currentStroke.points,
      STROKE_COLOUR,
      STROKE_WIDTH
    );
  }

  // Debug visualisation
  if (state.debug.showStrokePoints) {
    renderDebugPoints(renderer);
  }

  renderer.restore();
}

function renderStrokePoints(
  renderer: RenderAdapter,
  points: Point[],
  color: string,
  width: number
): void {
  if (points.length === 0) {
    return;
  }

  renderer.setStrokeStyle(color, width);

  renderer.beginPath();
  renderer.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    renderer.lineTo(points[i].x, points[i].y);
  }

  renderer.stroke();
}

function renderDebugPoints(renderer: RenderAdapter): void {
  // Render debug circles for all completed strokes
  for (const stroke of state.strokes) {
    if (stroke.points.length === 0) {
      continue;
    }

    // Draw circles at each point
    for (let i = 0; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      const isStart = i === 0;
      const isEnd = i === stroke.points.length - 1;

      renderer.arc(
        point.x,
        point.y,
        isStart || isEnd ? 8 : 4 // Bigger circles at start/end
      );

      if (isStart) {
        renderer.setFillStyle('#00ff00'); // Green for start
      } else if (isEnd) {
        renderer.setFillStyle('#ff0000'); // Red for end
      } else {
        renderer.setFillStyle('#0000ff'); // Blue for middle points
      }

      renderer.fill();
    }
  }

  // Render debug circles for current stroke being drawn
  if (state.currentStroke && state.currentStroke.points.length > 0) {
    for (let i = 0; i < state.currentStroke.points.length; i++) {
      const point = state.currentStroke.points[i];
      const isStart = i === 0;
      const isEnd = i === state.currentStroke.points.length - 1;

      renderer.arc(point.x, point.y, isStart || isEnd ? 4 : 2);

      if (isStart) {
        renderer.setFillStyle('#00ff00');
      } else if (isEnd) {
        renderer.setFillStyle('#ffff00'); // Yellow for current end
      } else {
        renderer.setFillStyle('#00ffff'); // Cyan for current middle
      }

      renderer.fill();
    }
  }
}

