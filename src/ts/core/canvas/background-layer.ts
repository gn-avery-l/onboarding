import { state } from '../state';
import { screenToWorld } from '../utils/transform';
import { getPlatform } from '../platform/platform-context';

export function renderBackgroundLayer(): void {
  const renderer = getPlatform().backgroundRenderer;
  const ctx = renderer.getContext();

  renderer.setFillStyle('#ffffff');
  renderer.fillRect(0, 0, ctx.width, ctx.height);

  if (state.background.currentBackground?.loaded) {
    const img = state.background.currentBackground.image!;

    renderer.save();
    renderer.translate(state.view.panX, state.view.panY);
    renderer.scale(state.view.zoom, state.view.zoom);

    const imgWidth = img.width;
    const imgHeight = img.height;

    const topLeft = screenToWorld(0, 0);
    const bottomRight = screenToWorld(ctx.width, ctx.height);

    const startX = Math.floor(topLeft.x / imgWidth) * imgWidth;
    const startY = Math.floor(topLeft.y / imgHeight) * imgHeight;
    const endX = Math.ceil(bottomRight.x / imgWidth) * imgWidth;
    const endY = Math.ceil(bottomRight.y / imgHeight) * imgHeight;

    for (let x = startX; x < endX; x += imgWidth) {
      for (let y = startY; y < endY; y += imgHeight) {
        renderer.drawImage(img, x, y, imgWidth, imgHeight);
      }
    }

    renderer.restore();
  }
}
