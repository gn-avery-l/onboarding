import { state } from '../state';
import { canvasManager } from './canvas-manager';
import { screenToWorld } from '../utils/transform';

export function renderBackgroundLayer(): void {
  if (!canvasManager) {
    return;
  }

  const ctx = canvasManager.getBackgroundContext();
  const canvas = ctx.canvas;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.background.currentBackground?.loaded) {
    const img = state.background.currentBackground.image!;

    ctx.save();
    ctx.translate(state.view.panX, state.view.panY);
    ctx.scale(state.view.zoom, state.view.zoom);

    const imgWidth = img.width;
    const imgHeight = img.height;

    const topLeft = screenToWorld(0, 0);
    const bottomRight = screenToWorld(canvas.width, canvas.height);

    const startX = Math.floor(topLeft.x / imgWidth) * imgWidth;
    const startY = Math.floor(topLeft.y / imgHeight) * imgHeight;
    const endX = Math.ceil(bottomRight.x / imgWidth) * imgWidth;
    const endY = Math.ceil(bottomRight.y / imgHeight) * imgHeight;

    for (let x = startX; x < endX; x += imgWidth) {
      for (let y = startY; y < endY; y += imgHeight) {
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
      }
    }

    ctx.restore();
  }
}
