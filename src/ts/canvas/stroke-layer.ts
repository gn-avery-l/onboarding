import { state } from '../state';
import { canvasManager } from './canvas-manager';
import { type Point } from '../types';

const STROKE_COLOUR = '#000000';
const STROKE_COLOUR_NEW = '#ff0000';
const STROKE_WIDTH = 2;

export function renderStrokeLayer(): void {
  if (!canvasManager) {
    return;
  }

  const ctx = canvasManager.getStrokeContext();
  const canvas = ctx.canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(state.view.panX, state.view.panY);
  ctx.scale(state.view.zoom, state.view.zoom);

  // Existing strokes
  for (const stroke of state.strokes) {
    renderStrokePoints(ctx, stroke.points, STROKE_COLOUR, STROKE_WIDTH);
  }

  // Newly drawn strokes
  if (state.currentStroke) {
    renderStrokePoints(
      ctx,
      state.currentStroke.points,
      STROKE_COLOUR,
      STROKE_WIDTH
    );
  }

  // Debug visualisation
  if (state.debug.showStrokePoints) {
    renderDebugPoints(ctx);
  }

  ctx.restore();
}

function renderStrokePoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  width: number
): void {
  if (points.length === 0) {
    return;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
}

function renderDebugPoints(ctx: CanvasRenderingContext2D): void {
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

      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        isStart || isEnd ? 8 : 4, // Bigger circles at start/end
        0,
        Math.PI * 2
      );

      if (isStart) {
        ctx.fillStyle = '#00ff00'; // Green for start
      } else if (isEnd) {
        ctx.fillStyle = '#ff0000'; // Red for end
      } else {
        ctx.fillStyle = '#0000ff'; // Blue for middle points
      }

      ctx.fill();
    }
  }

  // Render debug circles for current stroke being drawn
  if (state.currentStroke && state.currentStroke.points.length > 0) {
    for (let i = 0; i < state.currentStroke.points.length; i++) {
      const point = state.currentStroke.points[i];
      const isStart = i === 0;
      const isEnd = i === state.currentStroke.points.length - 1;

      ctx.beginPath();
      ctx.arc(point.x, point.y, isStart || isEnd ? 4 : 2, 0, Math.PI * 2);

      if (isStart) {
        ctx.fillStyle = '#00ff00';
      } else if (isEnd) {
        ctx.fillStyle = '#ffff00'; // Yellow for current end
      } else {
        ctx.fillStyle = '#00ffff'; // Cyan for current middle
      }

      ctx.fill();
    }
  }
}

