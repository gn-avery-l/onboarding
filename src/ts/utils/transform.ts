import { type Point, type ViewTransform } from '../types';
import { state } from '../state';

export function screenToWorld(
  screenX: number,
  screenY: number,
  view: ViewTransform = state.view
): Point {
  return {
    x: (screenX - view.panX) / view.zoom,
    y: (screenY - view.panY) / view.zoom
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  view: ViewTransform = state.view
): Point {
  return {
    x: worldX * view.zoom + view.panX,
    y: worldY * view.zoom + view.panY
  };
}
